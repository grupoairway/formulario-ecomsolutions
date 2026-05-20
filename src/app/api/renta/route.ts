import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { Resend } from 'resend';
import { RentaFormData, FileAttachmentRenta } from '@/lib/types-renta';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function richText(content: string) {
  const text = content ? content.slice(0, 2000) : '';
  return [{ text: { content: text } }];
}

function getTitle(data: RentaFormData): string {
  return `${data.nombreCompleto || 'Sin nombre'} - Renta ${data.ejercicioFiscal}`;
}

function domicilioTexto(data: RentaFormData): string {
  const d = data.domicilio;
  return [d.calle, d.numero, d.piso, d.cp, d.municipio, d.provincia].filter(Boolean).join(', ');
}

interface ResendAttachment {
  filename: string;
  content: Buffer;
  content_type: string;
}

function buildAttachments(data: RentaFormData): ResendAttachment[] {
  const attachments: ResendAttachment[] = [];

  function addFile(file: FileAttachmentRenta | null, label: string) {
    if (!file?.data) return;
    const base64 = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    if (!base64) return;
    const buf = Buffer.from(base64, 'base64');
    attachments.push({ filename: `${label}_${file.name}`, content: buf, content_type: file.type || 'application/octet-stream' });
    console.log(`[email] Adjunto: ${label}_${file.name} (${Math.round(buf.length / 1024)} KB)`);
  }

  addFile(data.dniAnverso, 'DNI_anverso');
  addFile(data.dniReverso, 'DNI_reverso');
  addFile(data.borradorHacienda, 'Borrador_Hacienda');
  addFile(data.certificadoRetencion1, 'Cert_Retenciones_1');
  addFile(data.certificadoRetencion2, 'Cert_Retenciones_2');
  addFile(data.certificadoRetencion3, 'Cert_Retenciones_3');

  return attachments;
}

async function sendEmails(data: RentaFormData) {
  const title = getTitle(data);
  const apiKey = process.env.RESEND_API_KEY;
  console.log('[email] Resend API key set:', !!apiKey, '| len:', apiKey?.length ?? 0);
  if (!apiKey) {
    console.error('[email] ERROR: RESEND_API_KEY no está definida.');
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
          Hemos recibido tus datos para gestionar tu <strong>declaración de la renta ${data.ejercicioFiscal}</strong>.
          Nuestro equipo la revisará y se pondrá en contacto contigo en menos de 24 horas para
          confirmar los próximos pasos.
        </p>
        <p style="color: #6b7280; line-height: 1.7; margin-bottom: 24px;">
          Si tienes más documentación (contratos, escrituras, justificantes de donativos, etc.)
          puedes enviárnosla por email a <strong>info@ecomsolutions.es</strong> o por WhatsApp.
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
          <td style="padding:8px 12px;font-size:0.8rem;font-weight:600;color:#6b7280;white-space:nowrap;width:200px;vertical-align:top;">${label}</td>
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

  const yesNo = (v: boolean | null) => (v === null ? '—' : v ? 'Sí' : 'No');

  const hijosTexto = data.hijos.length > 0
    ? data.hijos.map((h, i) => `Hijo ${i + 1}: ${h.nombre || '—'} (${h.fechaNacimiento || '—'})${h.discapacidad ? ` ${h.porcentajeDiscapacidad}% disc.` : ''}`).join(' | ')
    : 'No';

  const ascTexto = data.ascendientes.length > 0
    ? data.ascendientes.map((a, i) => `${i + 1}: ${a.nombre || '—'} NIF: ${a.nif || '—'}${a.discapacidad ? ` ${a.gradoDiscapacidad}% disc.` : ''}`).join(' | ')
    : 'No';

  const docs = [
    data.dniAnverso ? `DNI anverso: ${data.dniAnverso.name}` : null,
    data.dniReverso ? `DNI reverso: ${data.dniReverso.name}` : null,
    data.borradorHacienda ? `Borrador: ${data.borradorHacienda.name}` : null,
    data.certificadoRetencion1 ? `Cert. ret. 1: ${data.certificadoRetencion1.name}` : null,
    data.certificadoRetencion2 ? `Cert. ret. 2: ${data.certificadoRetencion2.name}` : null,
    data.certificadoRetencion3 ? `Cert. ret. 3: ${data.certificadoRetencion3.name}` : null,
  ].filter(Boolean).join(' · ') || 'Sin archivos adjuntos';

  const notifHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:640px;margin:24px auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <div style="background:#1a1a2e;padding:28px 32px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:1.1rem;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">EcomSolutions</span>
            <span style="color:#4a4a6a;font-size:1.2rem;">|</span>
            <span style="font-size:0.85rem;color:#a0a0c0;font-weight:500;">Declaración de la Renta</span>
          </div>
          <div style="margin-top:16px;">
            <div style="font-size:1.4rem;font-weight:700;color:#ffffff;line-height:1.2;">${data.nombreCompleto || 'Sin nombre'}</div>
            <div style="font-size:0.8rem;color:#a0a0c0;margin-top:6px;">
              Ejercicio ${data.ejercicioFiscal} · Recibido el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div style="background:#ffffff;padding:24px 32px;">
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <tbody>

              ${section('Datos personales',
                row('Nombre completo', data.nombreCompleto) +
                row('NIF / DNI', data.nif) +
                row('Fecha de nacimiento', data.fechaNacimiento) +
                row('Estado civil', data.estadoCivil) +
                row('Tipo declaración', data.declaracionTipo === 'conjunta' ? `Conjunta — ${data.conyuge.nombre} (${data.conyuge.nif})` : 'Individual') +
                row('Domicilio', domicilioTexto(data)) +
                row('Cambio domicilio', yesNo(data.cambioDomicilio)) +
                row('Teléfono', data.telefono) +
                row('Email', data.email)
              )}

              ${section('Situación familiar',
                row('Hijos a cargo', hijosTexto) +
                row('Ascendientes a cargo', ascTexto) +
                row('Discapacidad propia', data.tieneDiscapacidad ? `Sí — ${data.porcentajeDiscapacidad}%` : 'No') +
                row('Pensionista de viudedad', yesNo(data.esPensionistaViudedad))
              )}

              ${section('Ingresos y retenciones',
                row('Nóminas', data.tieneNominas
                  ? `Sí — ${data.numeroPagadores} pagador(es) · Bruto: ${data.importeBrutoTotal} € · Retenciones: ${data.retencionesTotal} €`
                  : 'No') +
                row('Prestación por desempleo', data.tieneDesempleo ? `Sí — ${data.importeDesempleo} €` : 'No') +
                row('Pensión', data.tienePension ? `Sí (${data.tipoPension}) — ${data.importePension} €` : 'No') +
                row('Ingresos autónomo', data.tieneAutonomo
                  ? `Sí — Régimen: ${data.regimenEstimacion} · Ingresos: ${data.ingresosAutonomo} € · Gastos: ${data.gastosAutonomo} €`
                  : 'No') +
                row('Inmuebles alquilados', data.tieneAlquiler
                  ? `Sí — Ingresos: ${data.ingresosAlquiler} € · Gastos: ${data.gastosAlquiler} €`
                  : 'No') +
                row('Ganancias/pérdidas', data.tieneGanancias ? `Sí — ${data.descripcionGanancias}` : 'No') +
                row('Capital mobiliario', data.tieneCapitalMobiliario ? `Sí — ${data.importeCapitalMobiliario} €` : 'No')
              )}

              ${section('Deducciones',
                row('Vivienda habitual antes 2013', yesNo(data.viviendaHabitual2013)) +
                row('Plan de pensiones', data.tienePlanPensiones ? `Sí — ${data.importePlanPensiones} €` : 'No') +
                row('Donativos', data.tieneDonativos ? `Sí — ${data.importeDonativos} €` : 'No') +
                row('Alquiler (contrato antes 2015)', yesNo(data.alquilerAntes2015)) +
                row('Devolución cláusula suelo', yesNo(data.clausulaSupelo)) +
                row('Provincia (ded. autonómicas)', data.domicilio.provincia)
              )}

              ${section('Documentación adjunta',
                row('Archivos', docs)
              )}

            </tbody>
          </table>
        </div>

        <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:0.75rem;color:#9ca3af;">
            EcomSolutions · formulario.ecomsolutions.es · Solicitud enviada desde /declaracion-renta
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  const attachments = buildAttachments(data);
  console.log('[email] Adjuntos preparados:', attachments.length);

  if (data.email) {
    console.log('[email] Enviando confirmación al cliente:', data.email);
    const { data: sent, error } = await resend.emails.send({
      from: 'EcomSolutions <noreply@ecomsolutions.es>',
      to: data.email,
      subject: `✅ Solicitud de declaración de la renta ${data.ejercicioFiscal} recibida`,
      html: clientHtml,
    });
    if (error) {
      console.error('[email] ERROR enviando al cliente:', error);
    } else {
      console.log('[email] Email cliente OK. id:', sent?.id);
    }
  }

  console.log('[email] Enviando notificación interna a: grupoairway@gmail.com');
  const { data: sentInterno, error: errorInterno } = await resend.emails.send({
    from: 'Formulario Renta <noreply@ecomsolutions.es>',
    to: 'grupoairway@gmail.com',
    subject: `Nueva declaración de renta: ${title}`,
    html: notifHtml,
    attachments,
  });
  if (errorInterno) {
    console.error('[email] ERROR enviando email interno:', errorInterno);
  } else {
    console.log('[email] Email interno OK. id:', sentInterno?.id);
  }
}

async function createNotionPage(data: RentaFormData): Promise<void> {
  // Notion DB ID para declaraciones de renta (configurar NOTION_RENTA_DB en env vars)
  const dbId = process.env.NOTION_RENTA_DB || '366774ba27998089b32cf62511ca2f3b';
  const today = new Date().toISOString().split('T')[0];

  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      'Nombre': {
        title: [{ text: { content: getTitle(data) } }],
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
        email: data.email || null,
      },
      'NIF': {
        rich_text: richText(data.nif),
      },
      'Teléfono': {
        phone_number: data.telefono || null,
      },
      'Ejercicio fiscal': {
        rich_text: richText(data.ejercicioFiscal),
      },
      'Tipo declaración': {
        select: data.declaracionTipo ? { name: data.declaracionTipo === 'conjunta' ? 'Conjunta' : 'Individual' } : null,
      },
      'Provincia': {
        rich_text: richText(data.domicilio.provincia),
      },
      'Domicilio': {
        rich_text: richText(domicilioTexto(data)),
      },
    } as Parameters<typeof notion.pages.create>[0]['properties'],
  });
}

export async function POST(request: NextRequest) {
  try {
    const data: RentaFormData = await request.json();

    console.log('[/api/renta] Solicitud recibida para:', data.nombreCompleto, '| Ejercicio:', data.ejercicioFiscal);
    console.log('[/api/renta] Adjuntos recibidos:', {
      dniAnverso: data.dniAnverso ? { name: data.dniAnverso.name, size: data.dniAnverso.size } : null,
      dniReverso: data.dniReverso ? { name: data.dniReverso.name, size: data.dniReverso.size } : null,
      borrador: data.borradorHacienda ? { name: data.borradorHacienda.name } : null,
    });

    await createNotionPage(data).catch((err: { code?: string; message?: string; body?: string }) => {
      console.error('[/api/renta] Notion FAILED —', { code: err?.code, message: err?.message, body: err?.body });
    });

    await sendEmails(data).catch((err: { message?: string }) => {
      console.error('[/api/renta] Email FAILED —', err?.message);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/renta] Fatal error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
