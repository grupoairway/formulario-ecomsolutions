import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import nodemailer from 'nodemailer';
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

type MailAttachment = NonNullable<nodemailer.SendMailOptions['attachments']>[number];

function buildAttachments(data: AutonomoFormData): MailAttachment[] {
  const attachments: MailAttachment[] = [];
  function addFile(file: FileAttachment | null, label: string) {
    if (!file?.data) return;
    const base64 = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    attachments.push({ filename: `${label}_${file.name}`, content: base64, encoding: 'base64', contentType: file.type });
  }
  addFile(data.dniAnverso, 'DNI_anverso');
  addFile(data.dniReverso, 'DNI_reverso');
  addFile(data.permisoTrabajo, 'permiso_trabajo');
  return attachments;
}

async function sendEmails(data: AutonomoFormData) {
  const title = getTitle(data);
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: { user: 'noreply@ecomsolutions.es', pass: process.env.SMTP_PASSWORD },
  });

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

  const notifHtml = `
    <div style="font-family: Inter, sans-serif; color: #111827;">
      <h2>Nueva solicitud de alta de autónomo</h2>
      <p><strong>Nombre:</strong> ${data.nombreCompleto}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.telefono}</p>
      <p><strong>DNI/NIE:</strong> ${data.numeroDocumento} (${data.tipoDocumento})</p>
      <p><strong>Domicilio:</strong> ${domicilioTexto(data)}</p>
      <p><strong>Actividad:</strong> ${data.descripcionActividad}</p>
      <p><strong>Epígrafe IAE:</strong> ${data.epigrafeIAE}</p>
      <p><strong>Fecha inicio:</strong> ${data.cuantoAntes ? 'Cuanto antes' : data.fechaInicio}</p>
      <p><strong>ROI:</strong> ${data.roi ? 'Sí' : 'No'}</p>
      <p><strong>Mutua:</strong> ${data.mutua}</p>
      <p><strong>IBAN:</strong> ${data.iban}</p>
      <p><strong>Ingresos netos estimados:</strong> ${data.ingresosNetos} €/mes</p>
      <p><strong>Tarifa reducida:</strong> ${data.noAltaDosAnios && data.sinDeudasSS ? 'Sí' : 'No'}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      <hr />
      <pre style="font-size:0.8rem;color:#6b7280;white-space:pre-wrap;">${JSON.stringify(
        { ...data, dniAnverso: data.dniAnverso ? `[${data.dniAnverso.name}]` : null, dniReverso: data.dniReverso ? `[${data.dniReverso.name}]` : null, permisoTrabajo: data.permisoTrabajo ? `[${data.permisoTrabajo.name}]` : null },
        null,
        2
      )}</pre>
    </div>
  `;

  const attachments = buildAttachments(data);

  const promises: Promise<unknown>[] = [];

  if (data.email) {
    promises.push(
      transporter.sendMail({
        from: '"EcomSolutions" <noreply@ecomsolutions.es>',
        to: data.email,
        subject: '✅ Solicitud de alta de autónomo recibida',
        html: clientHtml,
      })
    );
  }

  promises.push(
    transporter.sendMail({
      from: '"Formulario Alta Autónomo" <noreply@ecomsolutions.es>',
      to: 'info@ecomsolutions.es',
      subject: `Nueva solicitud: ${title}`,
      html: notifHtml,
      attachments,
    })
  );

  await Promise.allSettled(promises);
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
