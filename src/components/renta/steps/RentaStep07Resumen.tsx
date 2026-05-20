'use client';

import { RentaFormData, EJERCICIOS_FISCALES } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function yn(v: boolean | null | undefined) {
  return v === null || v === undefined ? '—' : v ? 'Sí' : 'No';
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.83rem' }}>
      <span style={{ color: 'var(--color-muted)', minWidth: 180, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--color-text)', fontWeight: 500, wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a1a2e', background: '#f8fafc', borderLeft: '3px solid #1a1a2e', padding: '6px 12px', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ padding: '0 4px' }}>{children}</div>
    </div>
  );
}

export default function RentaStep07Resumen({ formData, onChange, errors }: Props) {
  const { domicilio, conyuge, hijos, ascendientes, inmuebles } = formData;

  const domStr = [domicilio.calle, domicilio.numero, domicilio.piso, domicilio.cp, domicilio.municipio, domicilio.provincia].filter(Boolean).join(', ');

  const hijosStr = hijos.length > 0
    ? hijos.map((h, i) => `Hijo ${i + 1}: ${h.nombre || '—'} (NIF: ${h.nif || '—'}, nac. ${h.fechaNacimiento || '—'})${h.discapacidad ? ` · Discap. ${h.porcentajeDiscapacidad}%` : ''}`).join(' / ')
    : 'No';

  const ascStr = ascendientes.length > 0
    ? ascendientes.map((a, i) => `${i + 1}: ${a.nombre || '—'} — ${a.parentesco || '—'}${a.discapacidad ? ` · ${a.gradoDiscapacidad}% disc.` : ''}`).join(' / ')
    : 'No';

  const inmueblesStr = inmuebles.length > 0
    ? inmuebles.map((im, i) => `Inmueble ${i + 1}: ${im.referenciaCatastral || '—'} (${im.uso || '—'}) ${im.porcentajeTitularidad ? `${im.porcentajeTitularidad}%` : ''}`).join(' / ')
    : null;

  const dedsAut = formData.deduccionesAutonomicas.length > 0 ? formData.deduccionesAutonomicas.join(', ') : null;

  const docsEntregados = Object.entries(formData.documentosEntrega)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v === 'adjuntado' ? 'Adjunto' : 'Por email/WhatsApp'}`)
    .join(' · ') || null;

  return (
    <div>
      {/* Ejercicio fiscal */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Ejercicio fiscal <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          {EJERCICIOS_FISCALES.map((ej) => (
            <label
              key={ej.value}
              className={`${styles.radioBtn} ${formData.ejercicioFiscal === ej.value ? styles.selected : ''}`}
              onClick={() => onChange({ ejercicioFiscal: ej.value })}
            >
              {ej.label}
            </label>
          ))}
        </div>
        {errors.includes('ejercicioFiscal') && <div className={styles.errorMsg}>⚠ Selecciona el ejercicio fiscal.</div>}
      </div>

      {/* Resumen datos */}
      <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 16 }}>Resumen de los datos introducidos</div>

        <Section title="Datos personales">
          <Row label="Nombre completo" value={formData.nombreCompleto} />
          <Row label="NIF / DNI" value={formData.nif} />
          <Row label="Fecha nacimiento" value={formData.fechaNacimiento} />
          <Row label="Estado civil" value={formData.estadoCivil} />
          <Row label="Tipo declaración" value={formData.declaracionTipo === 'conjunta' ? `Conjunta — ${conyuge.nombre} (${conyuge.nif})` : 'Individual'} />
          <Row label="Domicilio" value={domStr} />
          <Row label="Cambio domicilio" value={yn(formData.cambioDomicilio)} />
          <Row label="Teléfono" value={formData.telefono} />
          <Row label="Email" value={formData.email} />
          <Row label="IBAN" value={formData.iban || null} />
          <Row label="Identificación electrónica" value={formData.claveCertificado || null} />
        </Section>

        <Section title="Situación familiar">
          <Row label="Hijos a cargo" value={hijosStr} />
          <Row label="Ascendientes a cargo" value={ascStr} />
          <Row label="Discapacidad propia" value={formData.tieneDiscapacidad ? `Sí — ${formData.porcentajeDiscapacidad}%` : 'No'} />
          <Row label="Pensionista de viudedad" value={yn(formData.esPensionistaViudedad)} />
          <Row label="Familia numerosa" value={formData.familiaNumerosa ? `Sí — ${formData.categoriaNumerosa}` : 'No'} />
          <Row label="Familia monoparental" value={yn(formData.familiaMonoparental)} />
        </Section>

        <Section title="Ingresos">
          {formData.tieneNominas && (
            <Row label="Nóminas"
              value={`${formData.numeroPagadores} pagador(es) · Bruto: ${formData.importeBrutoTotal} € · Retenc.: ${formData.retencionesTotal} €`} />
          )}
          {!formData.tieneNominas && <Row label="Nóminas" value="No" />}
          <Row label="Retribuciones en especie" value={formData.tieneRetribucionesEspecie ? `Sí — ${formData.descripcionRetribucionesEspecie}` : 'No'} />
          <Row label="Dietas / gastos viaje" value={formData.tieneDietas ? `Sí — ${formData.importeDietas} €` : 'No'} />
          <Row label="Desempleo" value={formData.tieneDesempleo ? `Sí — ${formData.importeDesempleo} €` : 'No'} />
          <Row label="Incapacidad temporal" value={formData.tieneIncapacidadTemporal ? `Sí — ${formData.importeIncapacidadTemporal} €` : 'No'} />
          <Row label="Maternidad/paternidad" value={formData.tieneMaternidadPaternidad ? `Sí — ${formData.importeMaternidadPaternidad} €` : 'No'} />
          <Row label="Pensión" value={formData.tienePension ? `Sí (${formData.tipoPension}) — ${formData.importePension} €` : 'No'} />
          {formData.tieneAutonomo && (
            <Row label="Autónomo"
              value={`Régimen: ${formData.regimenEstimacion} · Ingresos: ${formData.ingresosAutonomo} € · Gastos: ${formData.gastosAutonomo} € · SS: ${formData.cuotasSSAutonomo} €`} />
          )}
          {!formData.tieneAutonomo && <Row label="Autónomo" value="No" />}
          <Row label="Inmuebles" value={inmueblesStr || (formData.tieneInmuebles === false ? 'No' : null)} />
          <Row label="Cuentas extranjero" value={yn(formData.tieneCuentasExtranjero)} />
          <Row label="Dividendos extranjero" value={formData.tieneDividendosExtranjero ? `Sí — ${formData.importeDividendosExtranjero} €` : 'No'} />
          <Row label="Criptomonedas" value={formData.tieneCripto ? `Sí — ${formData.descripcionCripto}` : 'No'} />
          <Row label="Ganancias patrimoniales" value={formData.tieneGanancias ? `Sí — ${formData.descripcionGanancias}` : 'No'} />
          <Row label="Pérdidas anteriores" value={formData.tienePerdidasAnteriores ? `Sí — ${formData.importePerdidasAnteriores} €` : 'No'} />
          <Row label="Capital mobiliario" value={formData.tieneCapitalMobiliario ? `Sí — ${formData.importeCapitalMobiliario} €` : 'No'} />
        </Section>

        <Section title="Deducciones">
          <Row label="Vivienda habitual pre-2013" value={yn(formData.viviendaHabitual2013)} />
          <Row label="Plan de pensiones" value={formData.tienePlanPensiones ? `Sí — ${formData.importePlanPensiones} €` : 'No'} />
          <Row label="Aport. plan cónyuge" value={formData.tieneAportacionConyuge ? `Sí — ${formData.importeAportacionConyuge} €` : 'No'} />
          <Row label="PPA" value={formData.tienePPA ? `Sí — ${formData.importePPA} €` : 'No'} />
          <Row label="Seguro dependencia" value={formData.tieneSeguroDependencia ? `Sí — ${formData.importeSeguroDependencia} €` : 'No'} />
          <Row label="Pensión compensatoria" value={formData.tienePensionCompensatoria ? `Sí — ${formData.importePensionCompensatoria} €` : 'No'} />
          <Row label="Anualidades alimentos" value={formData.tieneAnualidadesAlimentos ? `Sí — ${formData.importeAnualidadesAlimentos} €` : 'No'} />
          <Row label="Donativos" value={formData.tieneDonativos ? `Sí — ${formData.importeDonativos} €` : 'No'} />
          <Row label="Alquiler (antes 2015)" value={yn(formData.alquilerAntes2015)} />
          <Row label="Cláusula suelo" value={yn(formData.clausulaSupelo)} />
          <Row label="Hijos <3 años / abono 140" value={formData.tieneHijosMenos3 ? `Sí — cobra abono: ${yn(formData.cobroAbono140)}` : 'No'} />
          <Row label="Guardería" value={formData.tieneGuarderia ? `Sí — ${formData.guarderia.nombreCentro} · ${formData.guarderia.importe} €` : 'No'} />
          <Row label="Inversión nueva empresa" value={formData.tieneInversionNuevaEmpresa ? `Sí — ${formData.importeInversionNuevaEmpresa} €` : 'No'} />
          <Row label="Rentas extranjero" value={formData.tieneRentasExtranjero ? `Sí — ${formData.importeRentasExtranjero} €` : 'No'} />
          <Row label="Deducciones autonómicas" value={dedsAut} />
        </Section>

        <Section title="Otras situaciones">
          <Row label="Residió fuera de España" value={yn(formData.residioFueraEspana)} />
          <Row label="Trabajó fuera de España" value={yn(formData.trabajoFueraEspana)} />
          <Row label="Fallecimiento familiar" value={yn(formData.fallecioFamiliar)} />
          <Row label="Requerimiento AEAT" value={yn(formData.recibioPRequerimiento)} />
          <Row label="Bases negativas anteriores" value={formData.tieneBasesNegativas ? `Sí — ${formData.importeBasesNegativas} €` : 'No'} />
          <Row label="Operaciones vinculadas" value={yn(formData.tieneOperacionesVinculadas)} />
          <Row label="Otras observaciones" value={formData.otrasSituaciones || null} />
        </Section>

        <Section title="Documentación">
          <Row label="DNI anverso" value={formData.dniAnverso ? formData.dniAnverso.name : 'No adjuntado'} />
          <Row label="DNI reverso" value={formData.dniReverso ? formData.dniReverso.name : 'No adjuntado'} />
          <Row label="Borrador Hacienda" value={formData.borradorHacienda ? formData.borradorHacienda.name : 'No adjuntado'} />
          <Row label="Docs. adicionales" value={docsEntregados} />
        </Section>
      </div>

      {/* Privacidad */}
      <div className={styles.fieldGroup}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.privacidad}
            onChange={(e) => onChange({ privacidad: e.target.checked })}
            style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0, accentColor: 'var(--color-blue)' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
            He leído y acepto la{' '}
            <a href="/politica-privacidad" target="_blank" style={{ color: 'var(--color-blue)', textDecoration: 'underline' }}>
              política de privacidad
            </a>
            {' '}de EcomSolutions. Autorizo el tratamiento de mis datos personales para la gestión de la declaración de la renta. <span style={{ color: 'var(--color-error)' }}>*</span>
          </span>
        </label>
        {errors.includes('privacidad') && <div className={styles.errorMsg} style={{ marginTop: 8 }}>⚠ Debes aceptar la política de privacidad para continuar.</div>}
      </div>

      <div className={styles.infoNote}>
        <span className={styles.infoNoteIcon}>🔒</span>
        <span>Tus datos se transmiten cifrados y se almacenan de forma segura. Solo serán utilizados para la gestión de tu declaración.</span>
      </div>
    </div>
  );
}
