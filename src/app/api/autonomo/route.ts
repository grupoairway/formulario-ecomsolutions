import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { Resend } from 'resend';
import { AutonomoFormData, FileAttachment } from '@/lib/types-autonomo';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function richText(content: string) {
  const text = content ? content.slice(0, 2000) : '';
  return [{ text: { content: text } }];
}

function getTitle(data: AutonomoFormData): string {
  return `${data.nombreCompleto || 'Sin nombre'} - Alta Autónomo`;
}

function domicilioTexto(data: AutonomoFormData): string {
  const d = data.domicilio;
  return [d.calle, d.numero, d.piso, d.cp, d.municipio, d.provincia].filter(Boolean).join(', ');
}

interface ResendAttachment {
  filename: string;
  content: Buffer;
  content_type: string;
}

function buildAttachments(data: AutonomoFormData): ResendAttachment[] {
  const attachments: ResendAttachment[] = [];
  function addFile(file: FileAttachment | null, label: string) {
    if (!file?.data) return;
    const base64 = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    if (!base64) return;
    const buf = Buffer.from(base64, 'base64');
    attachments.push({
      filename: `${label}_${file.name}`,
      content: buf,
      content_type: file.type || 'application/octet-stream',
    });
    console.log(`[email] Adjunto preparado: ${label}_${file.name} (${Math.round(buf.length / 1024)} KB)`);
  }
  addFile(data.dniAnverso, 'DNI_anverso');
  addFile(data.dniReverso, 'DNI_reverso');
  addFile(data.permisoTrabajo, 'permiso_trabajo');
  return attachments;
}

async function sendEmails(data: AutonomoFormData) {
  const title = getTitle(data);

  // ── Diagnóstico variables de entorno ──────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  console.log('[email] Resend API key set:', !!apiKey, '| len:', apiKey?.length ?? 0);
  if (!apiKey) {
    console.error('[email] ERROR: RESEND_API_KEY no está definida. Emails no enviados.');
    return;
  }
  const resend = new Resend(apiKey);

  const clientHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="background: #2563eb; padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 1.5rem;">EcomSolutions</h1>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #111827; margin-bottom: 16px;">¡Solicitud recibida!</h2>
        <p style="color: #6b7280; line-height: 1.7; margin-bottom: 16px;">
          Hemos recibido tu solicitud de alta como autónomo. Nuestro equipo la revisará
          y se pondrá en contacto contigo en menos de 24 horas para confirmar los próximos pasos.
        </p>
        <p style="color: #6b7280; line-height: 1.7; margin-bottom: 24px;">
          En breve te enviaremos también el <strong>mandato SEPA</strong> para que puedas
          firmarlo y tramitar la domiciliación de tu cuota de autónomo.
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

  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr>
          <td style="padding:8px 12px;font-size:0.8rem;font-weight:600;color:#6b7280;white-space:nowrap;width:180px;vertical-align:top;">${label}</td>
          <td style="padding:8px 12px;font-size:0.8rem;color:#111827;word-break:break-word;">${value}</td>
        </tr>`
      : '';

  const section = (title: string, rows: string) =>
    `<tr>
      <td colspan="2" style="padding:0;">
        <div style="background:#f8fafc;border-left:3px solid #1a1a2e;padding:8px 12px;margin-top:16px;margin-bottom:4px;">
          <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#1a1a2e;">${title}</span>
        </div>
      </td>
    </tr>
    ${rows}`;

  const docs = [
    data.dniAnverso ? `DNI/NIE anverso: ${data.dniAnverso.name}` : null,
    data.dniReverso ? `DNI/NIE reverso: ${data.dniReverso.name}` : null,
    data.permisoTrabajo ? `Permiso de trabajo: ${data.permisoTrabajo.name}` : null,
  ]
    .filter(Boolean)
    .join(' · ') || 'Sin archivos adjuntos';

  const notifHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:640px;margin:24px auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Cabecera -->
        <div style="background:#1a1a2e;padding:28px 32px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:1.1rem;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">EcomSolutions</span>
            <span style="color:#4a4a6a;font-size:1.2rem;">|</span>
            <span style="font-size:0.85rem;color:#a0a0c0;font-weight:500;">Alta de Autónomo</span>
          </div>
          <div style="margin-top:16px;">
            <div style="font-size:1.4rem;font-weight:700;color:#ffffff;line-height:1.2;">${data.nombreCompleto || 'Sin nombre'}</div>
            <div style="font-size:0.8rem;color:#a0a0c0;margin-top:6px;">Solicitud recibida el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <!-- Cuerpo -->
        <div style="background:#ffffff;padding:24px 32px;">
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <tbody>

              ${section('Datos personales',
                row('Nombre completo', data.nombreCompleto) +
                row('Email', data.email) +
                row('Teléfono', data.telefono) +
                row('DNI/NIE', `${data.numeroDocumento} (${tipoDocLabel(data.tipoDocumento)})`) +
                row('Fecha nacimiento', data.fechaNacimiento) +
                row('Nacionalidad', data.nacionalidad) +
                row('Estado civil', data.estadoCivil + (data.fechaEstadoCivil ? ` — ${data.fechaEstadoCivil}` : '')) +
                row('Domicilio', domicilioTexto(data)) +
                row('Centro de actividad', data.mismoCentroActividad ? 'Mismo que domicilio' :
                  [data.centroActividad.direccion, data.centroActividad.cp, data.centroActividad.municipio, data.centroActividad.provincia].filter(Boolean).join(', ') +
                  (data.centroActividad.m2 ? ` (${data.centroActividad.m2} m²)` : ''))
              )}

              ${section('Actividad',
                row('Descripción', data.descripcionActividad) +
                row('Fecha inicio', data.cuantoAntes ? 'Cuanto antes posible' : data.fechaInicio) +
                row('ROI intracomunitario', data.roi ? 'Sí' : 'No') +
                row('Epígrafe IAE', data.epigrafeIAE)
              )}

              ${section('Seguridad Social',
                row('Nº afiliación SS', data.numeroAfiliacionSS || 'No indicado') +
                row('Mutua', data.mutua) +
                row('IBAN domiciliación', data.iban) +
                row('Ingresos mensuales netos', data.ingresosNetos ? `${data.ingresosNetos} €/mes` : null) +
                row('Tarifa reducida (80€)', data.noAltaDosAnios && data.sinDeudasSS ? '✓ Cumple requisitos' : '✗ No cumple')
              )}

              ${section('Documentación adjunta',
                row('Archivos', docs)
              )}

            </tbody>
          </table>
        </div>

        <!-- Pie -->
        <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:0.75rem;color:#9ca3af;">
            EcomSolutions · formulario.ecomsolutions.es · Solicitud enviada desde /alta-autonomo
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  const attachments = buildAttachments(data);
  console.log('[email] Adjuntos preparados:', attachments.length, '—', attachments.map((a) => a.filename).join(', ') || 'ninguno');

  // ── Email al cliente ───────────────────────────────────────────────────────
  if (data.email) {
    console.log('[email] Intentando enviar email al cliente:', data.email);
    const { data: sent, error } = await resend.emails.send({
      from: 'EcomSolutions <noreply@ecomsolutions.es>',
      to: data.email,
      subject: '✅ Solicitud de alta de autónomo recibida',
      html: clientHtml,
    });
    if (error) {
      console.error('[email] ERROR enviando al cliente:', error);
    } else {
      console.log('[email] Email cliente enviado OK. id:', sent?.id);
    }
  } else {
    console.warn('[email] Sin email de cliente — omitiendo envío al solicitante.');
  }

  // ── Email interno ──────────────────────────────────────────────────────────
  console.log('[email] Intentando enviar email interno a: info@ecomsolutions.es');
  const { data: sentInterno, error: errorInterno } = await resend.emails.send({
    from: 'Formulario Alta Autónomo <noreply@ecomsolutions.es>',
    to: 'info@ecomsolutions.es',
    subject: `Nueva solicitud: ${title}`,
    html: notifHtml,
    attachments,
  });
  if (errorInterno) {
    console.error('[email] ERROR enviando email interno:', errorInterno);
  } else {
    console.log('[email] Email interno enviado OK. id:', sentInterno?.id);
  }
}

function normalizeMutua(mutua: string): string {
  const upper = mutua.toUpperCase();
  if (upper.includes('ASEPEYO')) return 'ASEPEYO';
  if (upper.includes('FREMAP')) return 'FREMAP';
  return 'Otra';
}

function tipoDocLabel(tipo: string): string {
  if (tipo === 'dni') return 'DNI';
  if (tipo === 'nie_comunitario') return 'NIE comunitario';
  if (tipo === 'nie_extracomunitario') return 'NIE extracomunitario';
  return tipo;
}

async function createNotionPage(data: AutonomoFormData): Promise<void> {
  const dbId = process.env.NOTION_AUTONOMOS_DB || '365774ba2799801094aaf402e58fa87e';
  const today = new Date().toISOString().split('T')[0];
  const fechaInicio = data.cuantoAntes ? today : (data.fechaInicio || today);
  const ingresos = parseFloat(data.ingresosNetos.replace(',', '.'));

  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      'Nombre': {
        title: [{ text: { content: getTitle(data) } }],
      },
      'Estado': {
        select: { name: 'Nuevo' },
      },
      'Fecha envío': {
        date: { start: today },
      },
      'Fecha nacimiento': {
        date: data.fechaNacimiento ? { start: data.fechaNacimiento } : null,
      },
      'Nacionalidad': {
        rich_text: richText(data.nacionalidad),
      },
      'DNI/NIE': {
        rich_text: richText(data.numeroDocumento),
      },
      'Tipo documento': {
        select: { name: tipoDocLabel(data.tipoDocumento) },
      },
      'Domicilio': {
        rich_text: richText(domicilioTexto(data)),
      },
      'Teléfono': {
        phone_number: data.telefono || null,
      },
      'Email': {
        email: data.email || null,
      },
      'Estado civil': {
        select: data.estadoCivil ? { name: data.estadoCivil } : null,
      },
      'Actividad': {
        rich_text: richText(data.descripcionActividad),
      },
      'Fecha inicio': {
        date: { start: fechaInicio },
      },
      'ROI': {
        checkbox: data.roi === true,
      },
      'Epígrafe IAE': {
        rich_text: richText(data.epigrafeIAE),
      },
      'Nº afiliación SS': {
        rich_text: richText(data.numeroAfiliacionSS),
      },
      'Mutua': {
        select: data.mutua ? { name: normalizeMutua(data.mutua) } : null,
      },
      'IBAN': {
        rich_text: richText(data.iban),
      },
      'Ingresos mensuales': {
        number: isNaN(ingresos) ? null : ingresos,
      },
      'Tarifa reducida': {
        checkbox: data.noAltaDosAnios && data.sinDeudasSS,
      },
    } as Parameters<typeof notion.pages.create>[0]['properties'],
  });
}

export async function POST(request: NextRequest) {
  try {
    const data: AutonomoFormData = await request.json();

    // Diagnóstico de archivos adjuntos
    console.log('[/api/autonomo] Adjuntos recibidos:', {
      dniAnverso:    data.dniAnverso    ? { name: data.dniAnverso.name,    size: data.dniAnverso.size,    type: data.dniAnverso.type,    dataLen: data.dniAnverso.data?.length ?? 0 }    : null,
      dniReverso:    data.dniReverso    ? { name: data.dniReverso.name,    size: data.dniReverso.size,    type: data.dniReverso.type,    dataLen: data.dniReverso.data?.length ?? 0 }    : null,
      permisoTrabajo: data.permisoTrabajo ? { name: data.permisoTrabajo.name, size: data.permisoTrabajo.size, type: data.permisoTrabajo.type, dataLen: data.permisoTrabajo.data?.length ?? 0 } : null,
    });

    // Notion y email son independientes: un fallo en Notion no bloquea el envío de emails
    await createNotionPage(data).catch((err: { code?: string; message?: string; body?: string }) => {
      console.error('[/api/autonomo] Notion FAILED —', {
        code: err?.code,
        message: err?.message,
        body: err?.body,
      });
    });

    await sendEmails(data).catch((err: { message?: string }) => {
      console.error('[/api/autonomo] Email FAILED —', err?.message);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/autonomo] Fatal error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
