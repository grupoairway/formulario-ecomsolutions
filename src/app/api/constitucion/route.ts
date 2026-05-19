import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import nodemailer from 'nodemailer';
import { FormData } from '@/lib/types';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function richText(content: string) {
  const text = content ? content.slice(0, 2000) : '';
  return [{ text: { content: text } }];
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
    const formData: FormData = await request.json();
    const dbId = process.env.NOTION_CONSTITUCIONES_DB;

    if (!dbId) {
      return NextResponse.json({ error: 'NOTION_CONSTITUCIONES_DB no configurado' }, { status: 500 });
    }

    const title = getTitle(formData);
    const today = new Date().toISOString().split('T')[0];
    const email = getEmailSolicitante(formData);
    const capital = capitalTotal(formData);

    const denominacionesText = formData.denominaciones
      .filter(Boolean)
      .join(' | ');

    const domicilioText = [
      formData.domicilio.direccion,
      formData.domicilio.municipio,
      formData.domicilio.codigoPostal,
      formData.domicilio.provincia,
    ]
      .filter(Boolean)
      .join(', ');

    await notion.pages.create({
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
          rich_text: richText(formData.metodoDenominacion),
        },
        'Denominaciones': {
          rich_text: richText(denominacionesText),
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
          select: formData.tipoAdministracion
            ? { name: formData.tipoAdministracion }
            : null,
        },
      } as Parameters<typeof notion.pages.create>[0]['properties'],
    });

    await sendEmails(formData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/constitucion]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
