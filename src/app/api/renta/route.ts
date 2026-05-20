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
          Si tienes más documentación (certificados de retenciones, contratos, escrituras, justificantes, etc.)
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

  const yn = (v: boolean | null | undefined) => (v === null || v === undefined ? '—' : v ? 'Sí' : 'No');

  const hijosTexto = data.hijos.length > 0
    ? data.hijos.map((h, i) => `Hijo ${i + 1}: ${h.nombre || '—'} NIF: ${h.nif || '—'} (nac. ${h.fechaNacimiento || '—'})${h.discapacidad ? ` · ${h.porcentajeDiscapacidad}% disc.` : ''} · Convive: ${yn(h.convive)}`).join('<br>')
    : 'No';

  const ascTexto = data.ascendientes.length > 0
    ? data.ascendientes.map((a, i) => `${i + 1}: ${a.nombre || '—'} NIF: ${a.nif || '—'} — ${a.parentesco || '—'}${a.discapacidad ? ` · ${a.gradoDiscapacidad}% disc.` : ''}`).join('<br>')
    : 'No';

  const inmueblesTexto = data.inmuebles.length > 0
    ? data.inmuebles.map((im, i) =>
        `Inmueble ${i + 1}: Ref. ${im.referenciaCatastral || '—'} · ${im.porcentajeTitularidad || '—'}% · Uso: ${im.uso || '—'}${im.uso === 'alquilado' ? ` · Ingresos: ${im.ingresosAlquiler} € · Gastos: ${im.gastosAlquiler} €` : ''}`
      ).join('<br>')
    : 'No';

  const dedsAutStr = data.deduccionesAutonomicas.length > 0 ? data.deduccionesAutonomicas.join(', ') : 'Ninguna';

  const docsEntregaStr = Object.entries(data.documentosEntrega)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v === 'adjuntado' ? 'Adjunto en email' : 'Por email/WhatsApp'}`)
    .join('<br>') || 'Sin documentación adicional indicada';

  const docs = [
    data.dniAnverso ? `DNI anverso: ${data.dniAnverso.name}` : null,
    data.dniReverso ? `DNI reverso: ${data.dniReverso.name}` : null,
    data.borradorHacienda ? `Borrador: ${data.borradorHacienda.name}` : null,
  ].filter(Boolean).join(' · ') || 'Sin archivos adjuntos';

  const notifHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:680px;margin:24px auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

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
                row('Cambio domicilio', yn(data.cambioDomicilio)) +
                row('IBAN', data.iban || null) +
                row('Identificación electrónica', data.claveCertificado || null) +
                row('Teléfono', data.telefono) +
                row('Email', data.email)
              )}

              ${section('Situación familiar',
                row('Hijos a cargo', hijosTexto) +
                row('Ascendientes a cargo', ascTexto) +
                row('Discapacidad propia', data.tieneDiscapacidad ? `Sí — ${data.porcentajeDiscapacidad}%` : 'No') +
                row('Pensionista de viudedad', yn(data.esPensionistaViudedad)) +
                row('Familia numerosa', data.familiaNumerosa ? `Sí — ${data.categoriaNumerosa}` : 'No') +
                row('Familia monoparental', yn(data.familiaMonoparental))
              )}

              ${section('Ingresos',
                row('Nóminas', data.tieneNominas
                  ? `Sí — ${data.numeroPagadores} pagador(es) · Bruto: ${data.importeBrutoTotal} € · Retenc.: ${data.retencionesTotal} €`
                  : 'No') +
                row('Retribuciones especie', data.tieneRetribucionesEspecie ? `Sí — ${data.descripcionRetribucionesEspecie}` : 'No') +
                row('Dietas / gastos viaje', data.tieneDietas ? `Sí — ${data.importeDietas} €` : 'No') +
                row('Desempleo', data.tieneDesempleo ? `Sí — ${data.importeDesempleo} €` : 'No') +
                row('Incapacidad temporal', data.tieneIncapacidadTemporal ? `Sí — ${data.importeIncapacidadTemporal} €` : 'No') +
                row('Maternidad/paternidad', data.tieneMaternidadPaternidad ? `Sí — ${data.importeMaternidadPaternidad} €` : 'No') +
                row('Pensión', data.tienePension ? `Sí (${data.tipoPension}) — ${data.importePension} €` : 'No') +
                row('Autónomo', data.tieneAutonomo
                  ? `Sí — Régimen: ${data.regimenEstimacion} · Ingresos: ${data.ingresosAutonomo} € · Gastos: ${data.gastosAutonomo} € · SS: ${data.cuotasSSAutonomo} € · Trabajadores: ${yn(data.tieneTrabajadoresAutonomo)} · Vehículo: ${yn(data.usaVehiculoActividad)} · Local: ${yn(data.usaLocalActividad)}`
                  : 'No') +
                row('Inmuebles', inmueblesTexto) +
                row('Cuentas extranjero', yn(data.tieneCuentasExtranjero)) +
                row('Dividendos extranjero', data.tieneDividendosExtranjero ? `Sí — ${data.importeDividendosExtranjero} €` : 'No') +
                row('Criptomonedas', data.tieneCripto ? `Sí — ${data.descripcionCripto}` : 'No') +
                row('Ganancias patrimoniales', data.tieneGanancias ? `Sí — ${data.descripcionGanancias}` : 'No') +
                row('Pérdidas anteriores', data.tienePerdidasAnteriores ? `Sí — ${data.importePerdidasAnteriores} €` : 'No') +
                row('Capital mobiliario', data.tieneCapitalMobiliario ? `Sí — ${data.importeCapitalMobiliario} €` : 'No')
              )}

              ${section('Deducciones',
                row('Vivienda habitual pre-2013', yn(data.viviendaHabitual2013)) +
                row('Plan de pensiones', data.tienePlanPensiones ? `Sí — ${data.importePlanPensiones} €` : 'No') +
                row('Aport. plan cónyuge', data.tieneAportacionConyuge ? `Sí — ${data.importeAportacionConyuge} €` : 'No') +
                row('PPA', data.tienePPA ? `Sí — ${data.importePPA} €` : 'No') +
                row('Seguro dependencia', data.tieneSeguroDependencia ? `Sí — ${data.importeSeguroDependencia} €` : 'No') +
                row('Pensión compensatoria', data.tienePensionCompensatoria ? `Sí — ${data.importePensionCompensatoria} €` : 'No') +
                row('Anualidades alimentos', data.tieneAnualidadesAlimentos ? `Sí — ${data.importeAnualidadesAlimentos} €` : 'No') +
                row('Donativos', data.tieneDonativos ? `Sí — ${data.importeDonativos} €` : 'No') +
                row('Alquiler (antes 2015)', yn(data.alquilerAntes2015)) +
                row('Cláusula suelo', yn(data.clausulaSupelo)) +
                row('Hijos <3 años', data.tieneHijosMenos3 ? `Sí — cobra abono 140: ${yn(data.cobroAbono140)}` : 'No') +
                row('Guardería', data.tieneGuarderia ? `Sí — ${data.guarderia.nombreCentro} (NIF: ${data.guarderia.nifCentro}) · ${data.guarderia.importe} €` : 'No') +
                row('Inversión nueva empresa', data.tieneInversionNuevaEmpresa ? `Sí — ${data.importeInversionNuevaEmpresa} €` : 'No') +
                row('Rentas extranjero', data.tieneRentasExtranjero ? `Sí — ${data.importeRentasExtranjero} €` : 'No') +
                row('Deducciones autonómicas', dedsAutStr)
              )}

              ${section('Otras situaciones',
                row('Residió fuera de España', yn(data.residioFueraEspana)) +
                row('Trabajó fuera de España', yn(data.trabajoFueraEspana)) +
                row('Fallecimiento familiar', yn(data.fallecioFamiliar)) +
                row('Requerimiento AEAT', yn(data.recibioPRequerimiento)) +
                row('Bases negativas anteriores', data.tieneBasesNegativas ? `Sí — ${data.importeBasesNegativas} €` : 'No') +
                row('Operaciones vinculadas', yn(data.tieneOperacionesVinculadas)) +
                row('Otras observaciones', data.otrasSituaciones || null)
              )}

              ${section('Documentación',
                row('Archivos adjuntos', docs) +
                row('Documentación adicional', docsEntregaStr)
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
  const dbId = process.env.NOTION_RENTA_DB || '366774ba27998089b32cf62511ca2f3b';
  const today = new Date().toISOString().split('T')[0];

  const tipoDeclaracion = data.declaracionTipo === 'conjunta' ? 'Conjunta' : 'Individual';

  const properties = {
    'Nombre': {
      title: [{ text: { content: getTitle(data) } }],
    },
    'Estado': {
      select: { name: 'Pendiente revisión' },
    },
    'Formulario completado': {
      checkbox: true,
    },
    'Fecha formulario': {
      date: { start: today },
    },
    'NIF': {
      rich_text: richText(data.nif),
    },
    'Ejercicio fiscal': {
      select: { name: data.ejercicioFiscal || '2025' },
    },
    'Tipo declaración': {
      select: { name: tipoDeclaracion },
    },
    'Provincia': {
      rich_text: richText(data.domicilio.provincia),
    },
    'Domicilio': {
      rich_text: richText(domicilioTexto(data)),
    },
    ...(data.email ? { 'Email solicitante': { email: data.email } } : {}),
    ...(data.telefono ? { 'Teléfono': { phone_number: data.telefono } } : {}),
  };

  console.log('[notion] DB ID:', dbId);
  console.log('[notion] NOTION_TOKEN set:', !!process.env.NOTION_TOKEN, '| len:', process.env.NOTION_TOKEN?.length ?? 0);
  console.log('[notion] Propiedades a enviar:', JSON.stringify({
    Nombre: getTitle(data),
    Estado: 'Pendiente revisión',
    'Formulario completado': true,
    'Fecha formulario': today,
    NIF: data.nif,
    'Ejercicio fiscal (select)': data.ejercicioFiscal || '2025',
    'Tipo declaración': tipoDeclaracion,
    Provincia: data.domicilio.provincia,
    'Email solicitante': data.email || '(omitido)',
    Teléfono: data.telefono || '(omitido)',
  }));

  const response = await notion.pages.create({
    parent: { database_id: dbId },
    properties: properties as Parameters<typeof notion.pages.create>[0]['properties'],
  });

  console.log('[notion] Página creada OK. ID:', (response as { id?: string }).id ?? '—');
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

    await createNotionPage(data).catch((err: unknown) => {
      console.error('[notion] FAILED — error completo:', JSON.stringify(err, null, 2));
      if (err instanceof Error) {
        console.error('[notion] message:', err.message);
        console.error('[notion] stack:', err.stack);
      }
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
