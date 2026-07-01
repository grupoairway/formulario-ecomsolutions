import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import nodemailer from 'nodemailer';
import { FormData } from '@/lib/types';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function richText(content: string) {
  const text = content ? content.slice(0, 2000) : '';
  return [{ text: { content: text } }];
}

// Mapeo de valores internos del formulario a las etiquetas exactas de los select de Notion
const METODO_DENOM_LABEL: Record<string, string> = {
  nuevo: 'Elegir',
  bolsa: 'Escoger existente',
  certificado: 'Ya tengo certificado',
};

const TIPO_ADMIN_LABEL: Record<string, string> = {
  solidarios: 'Solidarios',
  mancomunados: 'Mancomunados',
};

// Reparte las denominaciones del formulario en los 5 campos de Notion según el método
function denominacionesPorCampo(formData: FormData): string[] {
  const campos = ['', '', '', '', ''];
  if (formData.metodoDenominacion === 'nuevo') {
    formData.denominaciones.forEach((d, i) => {
      if (i < 5) campos[i] = d || '';
    });
  } else if (formData.metodoDenominacion === 'bolsa') {
    campos[0] = formData.nombreBolsa || '';
  } else if (formData.metodoDenominacion === 'certificado') {
    campos[0] = formData.denominacionCertificada || '';
  }
  return campos;
}

// --- Resumen legible para el cuerpo de la página (para copiar al DUE) ---
function labelTipoPersona(t: string): string {
  if (t === 'sr') return 'Sr.';
  if (t === 'sra') return 'Sra.';
  if (t === 'sociedad') return 'Sociedad';
  return t || '—';
}

const APORTACION_LABEL: Record<string, string> = {
  dineraria_acreditada: 'Dineraria (acreditada)',
  dineraria_no_acreditada: 'Dineraria (no acreditada)',
  no_dineraria: 'No dineraria',
};

type NotionBlock = Record<string, unknown>;

function heading(text: string): NotionBlock {
  return {
    object: 'block',
    type: 'heading_2',
    heading_2: { rich_text: [{ type: 'text', text: { content: text.slice(0, 2000) } }] },
  };
}

// Divide el texto en párrafos de <=1900 chars (límite de Notion ~2000 por bloque de texto)
function paragraphs(text: string): NotionBlock[] {
  const safe = text && text.length ? text : '—';
  const chunks: string[] = [];
  for (let i = 0; i < safe.length; i += 1900) chunks.push(safe.slice(i, i + 1900));
  return chunks.map((c) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: c } }] },
  }));
}

function parseAmount(a: string): number {
  const n = parseFloat((a || '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function buildResumenBlocks(formData: FormData): NotionBlock[] {
  const blocks: NotionBlock[] = [];

  // Denominación
  const denoms = denominacionesPorCampo(formData).filter(Boolean);
  blocks.push(heading('DENOMINACIÓN'));
  blocks.push(...paragraphs(denoms.length ? denoms.map((d, i) => `${i + 1}. ${d}`).join('\n') : '—'));

  // Tipo de sociedad (inferido por nº de socios)
  const tipoSociedad = formData.socios.length === 1
    ? 'SLU (Sociedad Limitada Unipersonal)'
    : 'SL (Sociedad Limitada)';
  blocks.push(heading('TIPO DE SOCIEDAD'));
  blocks.push(...paragraphs(tipoSociedad));

  // Capital social
  blocks.push(heading('CAPITAL SOCIAL'));
  blocks.push(...paragraphs(`${capitalTotal(formData).toLocaleString('es-ES')} €`));

  // Domicilio social
  const dom = formData.domicilio;
  blocks.push(heading('DOMICILIO SOCIAL'));
  blocks.push(...paragraphs([
    `Dirección: ${dom.direccion || '—'}`,
    `Municipio: ${dom.municipio || '—'}`,
    `Código postal: ${dom.codigoPostal || '—'}`,
    `Provincia: ${dom.provincia || '—'}`,
    `Superficie: ${dom.superficie || '—'} m²`,
    `% afecto a la actividad: ${dom.porcentajeActividad || '—'}%`,
  ].join('\n')));

  // Actividad / CNAE
  blocks.push(heading('ACTIVIDAD / CNAE'));
  blocks.push(...paragraphs([
    `Actividad / CNAE: ${formData.actividad || '—'}`,
    `ROI intracomunitario: ${formData.roi === true ? 'Sí' : formData.roi === false ? 'No' : '—'}`,
    `Fecha inicio actividad: ${formData.fechaInicioActividad || '—'}`,
  ].join('\n')));

  // Socios
  blocks.push(heading('SOCIOS'));
  const totalAport = formData.socios.reduce((s, x) => s + parseAmount(x.aportacion), 0);
  if (formData.socios.length === 0) {
    blocks.push(...paragraphs('—'));
  } else {
    formData.socios.forEach((s, i) => {
      const nombre = [s.nombre, s.primerApellido, s.segundoApellido].filter(Boolean).join(' ') || '—';
      const pct = totalAport > 0 ? ((parseAmount(s.aportacion) / totalAport) * 100).toFixed(2) : '0.00';
      blocks.push(...paragraphs(
        `${i + 1}. ${labelTipoPersona(s.tipo)} ${nombre}\n` +
        `   NIF/DNI: ${s.documento || '—'}\n` +
        `   Participación: ${pct}%  ·  Aportación: ${APORTACION_LABEL[s.tipoAportacion] || '—'}` +
        `${s.aportacion ? ` (${s.aportacion} €)` : ''}\n` +
        `   Nacionalidad: ${s.nacionalidad || '—'}` +
        `${s.estadoCivil ? `  ·  Estado civil: ${s.estadoCivil}` : ''}` +
        `${s.email ? `  ·  Email: ${s.email}` : ''}`
      ));
    });
  }

  // Administradores
  blocks.push(heading('ADMINISTRADORES'));
  blocks.push(...paragraphs(`Tipo de administración: ${TIPO_ADMIN_LABEL[formData.tipoAdministracion] || '—'}`));
  if (formData.administradores.length === 0) {
    blocks.push(...paragraphs('—'));
  } else {
    formData.administradores.forEach((a, i) => {
      const nombre = [a.nombre, a.apellidos].filter(Boolean).join(' ') || '—';
      const retrib = a.cobranRetribucion
        ? (a.tipoRetribucion === 'porcentual'
            ? `Sí (${a.porcentajeRetribucion || '—'}%)`
            : a.tipoRetribucion === 'fija' ? 'Sí (fija)' : 'Sí')
        : a.cobranRetribucion === false ? 'No' : '—';
      let linea =
        `${i + 1}. ${a.tipo === 'sociedad' ? 'Sociedad' : 'Persona física'} ${nombre}\n` +
        `   NIF/DNI: ${a.documento || '—'}\n` +
        `   Retribución: ${retrib}  ·  Autónomo societario: ` +
        `${a.esAutonomoSocietario === true ? 'Sí' : a.esAutonomoSocietario === false ? 'No' : '—'}`;
      if (a.tipo === 'sociedad' && (a.representanteNombre || a.representanteApellidos)) {
        linea += `\n   Representante: ${[a.representanteNombre, a.representanteApellidos].filter(Boolean).join(' ')} (${a.representanteDocumento || '—'})`;
      }
      if (a.esAutonomoSocietario) {
        linea += `\n   Nº afiliación SS: ${a.numeroAfiliacionSS || '—'}  ·  Mutua: ${a.mutua || '—'}  ·  IBAN: ${a.iban || '—'}`;
      }
      blocks.push(...paragraphs(linea));
    });
  }

  return blocks;
}

function getTitle(formData: FormData): string {
  if (formData.metodoDenominacion === 'nuevo') {
    return `${formData.denominaciones[0] || 'Sin nombre'} - Constitución SL`;
  }
  if (formData.metodoDenominacion === 'bolsa') {
    return `${formData.nombreBolsa || 'Sin nombre'} - Constitución SL`;
  }
  return `${formData.denominacionCertificada || 'Sin nombre'} - Constitución SL`;
}

function getEmailSolicitante(formData: FormData): string {
  const primerSocio = formData.socios[0];
  return primerSocio?.email || '';
}

function capitalTotal(formData: FormData): number {
  let total = 0;
  for (const socio of formData.socios) {
    if (
      socio.tipoAportacion === 'dineraria_acreditada' ||
      socio.tipoAportacion === 'dineraria_no_acreditada'
    ) {
      const amount = parseFloat(socio.aportacion.replace(',', '.'));
      if (!isNaN(amount)) total += amount;
    }
  }
  return total;
}

async function sendEmails(formData: FormData) {
  const email = getEmailSolicitante(formData);
  const title = getTitle(formData);

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: 'noreply@ecomsolutions.es',
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const clientHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="background: #2563eb; padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 1.5rem;">EcomSolutions</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #111827; margin-bottom: 16px;">¡Solicitud recibida!</h2>
        <p style="color: #6b7280; line-height: 1.7; margin-bottom: 24px;">
          Hemos recibido tu solicitud para constituir la sociedad <strong>${title.replace(' - Constitución SL', '')}</strong>.
          Nos pondremos en contacto contigo en menos de 24 horas para confirmar los próximos pasos.
        </p>
        <a href="https://wa.me/34661959962"
           style="display:inline-block;background:#25d366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          💬 Hablar por WhatsApp
        </a>
        <p style="margin-top: 32px; color: #9ca3af; font-size: 0.85rem;">
          EcomSolutions · formulario.ecomsolutions.es
        </p>
      </div>
    </div>
  `;

  const notifHtml = `
    <div style="font-family: Inter, sans-serif; color: #111827;">
      <h2>Nueva solicitud de constitución SL</h2>
      <p><strong>Sociedad:</strong> ${title}</p>
      <p><strong>Email solicitante:</strong> ${email}</p>
      <p><strong>Socios:</strong> ${formData.socios.length}</p>
      <p><strong>Capital social:</strong> ${capitalTotal(formData).toLocaleString('es-ES')}€</p>
      <p><strong>Tipo administración:</strong> ${formData.tipoAdministracion}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      <hr />
      <pre style="font-size:0.8rem;color:#6b7280;">${JSON.stringify(formData, null, 2)}</pre>
    </div>
  `;

  const promises: Promise<unknown>[] = [];

  if (email) {
    promises.push(
      transporter.sendMail({
        from: '"EcomSolutions" <noreply@ecomsolutions.es>',
        to: email,
        subject: '✅ Solicitud de constitución SL recibida',
        html: clientHtml,
      })
    );
  }

  promises.push(
    transporter.sendMail({
      from: '"Formulario Constitución" <noreply@ecomsolutions.es>',
      to: 'info@ecomsolutions.es',
      subject: `Nueva solicitud: ${title}`,
      html: notifHtml,
    })
  );

  await Promise.allSettled(promises);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FormData & { clienteId?: string };
    const formData: FormData = body;
    const clienteId = (body.clienteId || '').trim();
    const dbId = process.env.NOTION_CONSTITUCIONES_DB;

    if (!dbId) {
      return NextResponse.json({ error: 'NOTION_CONSTITUCIONES_DB no configurado' }, { status: 500 });
    }

    const title = getTitle(formData);
    const today = new Date().toISOString().split('T')[0];
    const email = getEmailSolicitante(formData);
    const capital = capitalTotal(formData);

    const denomCampos = denominacionesPorCampo(formData);
    const metodoLabel = METODO_DENOM_LABEL[formData.metodoDenominacion] || null;
    const tipoAdminLabel = TIPO_ADMIN_LABEL[formData.tipoAdministracion] || null;

    const domicilioText = [
      formData.domicilio.direccion,
      formData.domicilio.municipio,
      formData.domicilio.codigoPostal,
      formData.domicilio.provincia,
    ]
      .filter(Boolean)
      .join(', ');

    let createdPageId = '';
    try {
    const created = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        'Nombre': {
          title: [{ text: { content: title } }],
        },
        'Estado': {
          select: { name: 'Nuevo' },
        },
        'Formulario completado': {
          checkbox: true,
        },
        'Fecha formulario': {
          date: { start: today },
        },
        'Email solicitante': {
          email: email || null,
        },
        'Método denominación': {
          select: metodoLabel ? { name: metodoLabel } : null,
        },
        'Denominación 1': {
          rich_text: richText(denomCampos[0]),
        },
        'Denominación 2': {
          rich_text: richText(denomCampos[1]),
        },
        'Denominación 3': {
          rich_text: richText(denomCampos[2]),
        },
        'Denominación 4': {
          rich_text: richText(denomCampos[3]),
        },
        'Denominación 5': {
          rich_text: richText(denomCampos[4]),
        },
        'Actividad CNAE': {
          rich_text: richText(formData.actividad),
        },
        'ROI intracomunitario': {
          checkbox: formData.roi === true,
        },
        'Domicilio social': {
          rich_text: richText(domicilioText),
        },
        'Provincia': {
          rich_text: richText(formData.domicilio.provincia),
        },
        'Municipio': {
          rich_text: richText(formData.domicilio.municipio),
        },
        'Código postal': {
          rich_text: richText(formData.domicilio.codigoPostal),
        },
        'Superficie m2': {
          number: parseFloat(formData.domicilio.superficie) || 0,
        },
        'Socios JSON': {
          rich_text: richText(JSON.stringify(formData.socios)),
        },
        'Administradores JSON': {
          rich_text: richText(JSON.stringify(formData.administradores)),
        },
        'Capital social total': {
          number: capital,
        },
        'Tipo administración': {
          select: tipoAdminLabel ? { name: tipoAdminLabel } : null,
        },
      } as Parameters<typeof notion.pages.create>[0]['properties'],
    });
    createdPageId = (created as { id: string }).id;
    } catch (err) {
      const notionErr = err as { body?: unknown; message?: string };
      console.error(
        '[constitucion] Notion error:',
        JSON.stringify(notionErr?.body || notionErr, null, 2)
      );
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }

    // Enlaza el registro con el Cliente (best-effort). Un clienteId inválido NUNCA
    // debe afectar al registro ya creado ni al resumen.
    if (createdPageId && clienteId) {
      try {
        await notion.pages.update({
          page_id: createdPageId,
          properties: {
            'Cliente': { relation: [{ id: clienteId }] },
          } as Parameters<typeof notion.pages.update>[0]['properties'],
        });
      } catch (err) {
        console.error('[constitucion] No se pudo enlazar Cliente (clienteId=' + clienteId + '):', err);
      }
    }

    // Añade el resumen legible al CUERPO de la página (para copiar al DUE). Best-effort.
    if (createdPageId) {
      try {
        const blocks = buildResumenBlocks(formData);
        for (let i = 0; i < blocks.length; i += 100) {
          await notion.blocks.children.append({
            block_id: createdPageId,
            children: blocks.slice(i, i + 100) as Parameters<
              typeof notion.blocks.children.append
            >[0]['children'],
          });
        }
      } catch (err) {
        console.error('[constitucion] Error añadiendo resumen al cuerpo:', err);
      }
    }

    await sendEmails(formData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/constitucion]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
