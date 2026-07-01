import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import nodemailer from 'nodemailer';
import { FormData, DireccionDetallada } from '@/lib/types';

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

const DURACION_LABEL: Record<string, string> = {
  indefinida: 'Indefinida',
  determinada: 'Determinada',
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

// Ensambla una dirección desglosada en una línea legible
function formatDireccion(d: DireccionDetallada): string {
  const via = [d.tipoVia, d.nombreVia, d.numero].filter(Boolean).join(' ');
  const detalle = [
    d.bloque ? `Bloque ${d.bloque}` : '',
    d.piso ? `Piso ${d.piso}` : '',
    d.puerta ? `Puerta ${d.puerta}` : '',
  ]
    .filter(Boolean)
    .join(', ');
  const cpMun = [d.codigoPostal, d.municipio].filter(Boolean).join(' ');
  return [via, detalle, cpMun, d.provincia].filter(Boolean).join(', ') || '—';
}

// --- Resumen legible para el cuerpo de la página (para copiar al DUE) ---
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

function euros(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// Resumen en el ORDEN DEL DUE: Empresa → Domicilios → Socios → Administración → Representantes → Centro
function buildResumenBlocks(formData: FormData): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const yn = (v: boolean | null) => (v === true ? 'Sí' : v === false ? 'No' : '—');

  // 1) EMPRESA
  blocks.push(heading('EMPRESA'));
  const denoms = denominacionesPorCampo(formData).filter(Boolean);
  const tipoSociedad = formData.socios.length === 1
    ? 'SLU (Sociedad Limitada Unipersonal)'
    : 'SL (Sociedad Limitada)';
  const duracion = formData.duracionSociedad === 'determinada'
    ? `Determinada${formData.duracionAnios ? ` (${formData.duracionAnios} años)` : ''}`
    : 'Indefinida';
  blocks.push(...paragraphs([
    `Denominación(es): ${denoms.length ? denoms.join(' | ') : '—'}`,
    `Tipo de sociedad: ${tipoSociedad}`,
    `Capital social: ${formData.capitalSocial ? euros(parseAmount(formData.capitalSocial)) : '—'}`,
    `Cierre de ejercicio: ${formData.cierreEjercicio || '—'}`,
    `Duración: ${duracion}`,
  ].join('\n')));

  // 2) DOMICILIOS
  blocks.push(heading('DOMICILIOS'));
  const dom = formData.domicilio;
  blocks.push(...paragraphs([
    `Domicilio social: ${formatDireccion(dom.direccion)}`,
    `Superficie: ${dom.superficie || '—'} m²  ·  % afecto a la actividad: ${dom.porcentajeActividad || '—'}%`,
    `Domicilio fiscal / notificaciones: (mismo que el social)`,
  ].join('\n')));

  // 3) SOCIOS (persona física / persona jurídica)
  blocks.push(heading('SOCIOS'));
  const totalAport = formData.socios.reduce((s, x) => s + parseAmount(x.importeAportacion), 0);
  if (!formData.socios.length) {
    blocks.push(...paragraphs('—'));
  } else {
    formData.socios.forEach((s, i) => {
      const pct = totalAport > 0 ? ((parseAmount(s.importeAportacion) / totalAport) * 100).toFixed(2) : '0.00';
      const aport = `${APORTACION_LABEL[s.tipoAportacion] || '—'}${s.importeAportacion ? ` — ${euros(parseAmount(s.importeAportacion))}` : ''}`;
      const domSocio = s.mismoDomicilio ? '(mismo que el social)' : formatDireccion(s.direccion);
      let linea: string;
      if (s.tipo === 'sociedad') {
        linea =
          `${i + 1}. [Persona jurídica] ${s.nombre || '—'}\n` +
          `   NIF/CIF: ${s.documento || '—'}\n` +
          `   Fecha constitución: ${s.fechaNacimientoConstitucion || '—'}  ·  Fecha inscripción: ${s.fechaInscripcion || '—'}\n` +
          `   Nacionalidad: ${s.nacionalidad || '—'}\n` +
          `   Domicilio: ${domSocio}\n` +
          `   Participación: ${pct}%  ·  Aportación: ${aport}`;
      } else {
        const nombre = [s.nombre, s.primerApellido, s.segundoApellido].filter(Boolean).join(' ') || '—';
        const sexo = s.sexo === 'hombre' ? 'Hombre' : s.sexo === 'mujer' ? 'Mujer' : '—';
        linea =
          `${i + 1}. [Persona física] ${nombre}\n` +
          `   DNI/NIF/NIE: ${s.documento || '—'}  ·  Sexo: ${sexo}  ·  Nacionalidad: ${s.nacionalidad || '—'}\n` +
          `   Fecha de nacimiento: ${s.fechaNacimientoConstitucion || '—'}  ·  Estado civil: ${s.estadoCivil || '—'}\n` +
          `   Domicilio: ${domSocio}\n` +
          `   Participación: ${pct}%  ·  Aportación: ${aport}` +
          `${s.email ? `\n   Email: ${s.email}` : ''}`;
      }
      if (s.tipoAportacion === 'no_dineraria' && s.descripcionBienes) {
        linea += `\n   Bienes aportados: ${s.descripcionBienes}`;
      }
      blocks.push(...paragraphs(linea));
    });

    const capital = parseAmount(formData.capitalSocial);
    const cuadra = capital > 0 && Math.abs(totalAport - capital) < 0.005;
    blocks.push(...paragraphs(
      `Total aportado: ${euros(totalAport)}  ·  Capital social declarado: ${euros(capital)}  ·  ` +
      `${cuadra ? 'CUADRA ✓' : 'NO CUADRA ⚠ (revisar)'}`
    ));
  }

  // 4) ÓRGANO DE ADMINISTRACIÓN
  blocks.push(heading('ÓRGANO DE ADMINISTRACIÓN'));
  blocks.push(...paragraphs(`Tipo de administración: ${TIPO_ADMIN_LABEL[formData.tipoAdministracion] || '—'}`));
  if (!formData.administradores.length) {
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
        `${i + 1}. ${a.tipo === 'sociedad' ? '[Persona jurídica]' : '[Persona física]'} ${nombre}\n` +
        `   NIF/DNI: ${a.documento || '—'}\n` +
        `   Retribución: ${retrib}  ·  Autónomo societario: ${yn(a.esAutonomoSocietario)}`;
      if (a.esAutonomoSocietario) {
        linea += `\n   Nº afiliación SS: ${a.numeroAfiliacionSS || '—'}  ·  Mutua: ${a.mutua || '—'}  ·  IBAN: ${a.iban || '—'}`;
      }
      blocks.push(...paragraphs(linea));
    });
  }

  // 5) REPRESENTANTES (de personas jurídicas: socios y administradores)
  const reps: string[] = [];
  formData.socios.forEach((s, i) => {
    if (s.tipo === 'sociedad') {
      const rn = [s.representanteNombre, s.representanteApellidos].filter(Boolean).join(' ') || '—';
      reps.push(`Socio ${i + 1} (${s.nombre || '—'}): ${rn} — ${s.representanteDocumento || '—'}`);
    }
  });
  formData.administradores.forEach((a, i) => {
    if (a.tipo === 'sociedad') {
      const rn = [a.representanteNombre, a.representanteApellidos].filter(Boolean).join(' ') || '—';
      reps.push(`Administrador ${i + 1} (${a.nombre || '—'}): ${rn} — ${a.representanteDocumento || '—'}`);
    }
  });
  blocks.push(heading('REPRESENTANTES'));
  blocks.push(...paragraphs(reps.length ? reps.join('\n') : 'No hay personas jurídicas con representante.'));

  // 6) CENTRO DE ACTIVIDAD (+ actividad principal y secundarias en texto)
  blocks.push(heading('CENTRO DE ACTIVIDAD'));
  const centroLines: string[] = [];
  if (formData.mismoCentroActividad === false) {
    const c = formData.centroActividad;
    centroLines.push(`Domicilio: ${formatDireccion(c.direccion)}`);
    centroLines.push(`Superficie: ${c.superficie || '—'} m²  ·  % afecto a la actividad: ${c.porcentajeActividad || '—'}%`);
  } else {
    centroLines.push('Domicilio: (mismo que el domicilio social)');
    centroLines.push(
      `Superficie: ${formData.domicilio.superficie || '—'} m²  ·  ` +
      `% afecto a la actividad: ${formData.domicilio.porcentajeActividad || '—'}%`
    );
  }
  const secundarias = formData.actividadesSecundarias.filter(Boolean);
  centroLines.push(`Actividad principal: ${formData.actividadPrincipal || '—'}`);
  centroLines.push(`Actividades secundarias: ${secundarias.length ? secundarias.join(' | ') : '—'}`);
  centroLines.push(`ROI intracomunitario: ${yn(formData.roi)}  ·  Fecha inicio actividad: ${formData.fechaInicioActividad || '—'}`);
  blocks.push(...paragraphs(centroLines.join('\n')));

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

// Capital social declarado por el cliente (campo propio, ya no derivado de la suma)
function capitalTotal(formData: FormData): number {
  return parseAmount(formData.capitalSocial);
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
    const duracionLabel = DURACION_LABEL[formData.duracionSociedad] || 'Indefinida';
    const actividadesSecText = formData.actividadesSecundarias.filter(Boolean).join(' | ');

    const domicilioText = formatDireccion(formData.domicilio.direccion);

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
        'Actividad principal': {
          rich_text: richText(formData.actividadPrincipal),
        },
        'Actividades secundarias': {
          rich_text: richText(actividadesSecText),
        },
        'Cierre ejercicio': {
          rich_text: richText(formData.cierreEjercicio),
        },
        'Duración sociedad': {
          select: { name: duracionLabel },
        },
        'ROI intracomunitario': {
          checkbox: formData.roi === true,
        },
        'Domicilio social': {
          rich_text: richText(domicilioText),
        },
        'Provincia': {
          rich_text: richText(formData.domicilio.direccion.provincia),
        },
        'Municipio': {
          rich_text: richText(formData.domicilio.direccion.municipio),
        },
        'Código postal': {
          rich_text: richText(formData.domicilio.direccion.codigoPostal),
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
