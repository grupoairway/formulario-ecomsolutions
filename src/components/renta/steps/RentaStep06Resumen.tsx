'use client';

import { useState } from 'react';
import { RentaFormData, EJERCICIOS_FISCALES } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.resumenSection}>
      <div className={styles.resumenHeader} onClick={() => setOpen(!open)}>
        <span className={styles.resumenHeaderTitle}>{title}</span>
        <span className={`${styles.resumenChevron} ${open ? styles.resumenChevronOpen : ''}`}>▼</span>
      </div>
      {open && <div className={styles.resumenBody}>{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined | null | boolean }) {
  if (value === undefined || value === null || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value;
  return (
    <div className={styles.resumenRow}>
      <span className={styles.resumenKey}>{label}</span>
      <span className={styles.resumenVal}>{display}</span>
    </div>
  );
}

function yesNo(v: boolean | null): string {
  if (v === null) return 'No indicado';
  return v ? 'Sí' : 'No';
}

export default function RentaStep06Resumen({ formData, onChange, errors }: Props) {
  const { domicilio } = formData;

  const domicilioTexto = [domicilio.calle, domicilio.numero, domicilio.piso, domicilio.cp, domicilio.municipio, domicilio.provincia]
    .filter(Boolean)
    .join(', ');

  const hijosTexto = formData.hijos.length > 0
    ? formData.hijos.map((h, i) => `Hijo ${i + 1}: ${h.nombre || 'Sin nombre'} (${h.fechaNacimiento || 'sin fecha'})${h.discapacidad ? ` — ${h.porcentajeDiscapacidad}% discapacidad` : ''}`).join(' · ')
    : null;

  const ascendientesTexto = formData.ascendientes.length > 0
    ? formData.ascendientes.map((a, i) => `${i + 1}: ${a.nombre || 'Sin nombre'} (NIF: ${a.nif || '—'})${a.discapacidad ? ` — ${a.gradoDiscapacidad}% discapacidad` : ''}`).join(' · ')
    : null;

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Revisa todos los datos antes de enviar. Si necesitas corregir algo, usa el botón
        &ldquo;Anterior&rdquo; para volver al paso correspondiente.
      </p>

      {/* Ejercicio fiscal */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Ejercicio fiscal al que corresponde la declaración <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          {EJERCICIOS_FISCALES.map((ej) => (
            <label
              key={ej}
              className={`${styles.radioBtn} ${formData.ejercicioFiscal === ej ? styles.selected : ''}`}
              onClick={() => onChange({ ejercicioFiscal: ej })}
            >
              Ejercicio {ej}
            </label>
          ))}
        </div>
      </div>

      <Section title="1. Datos personales">
        <Row label="Nombre completo" value={formData.nombreCompleto} />
        <Row label="NIF / DNI" value={formData.nif} />
        <Row label="Fecha de nacimiento" value={formData.fechaNacimiento} />
        <Row label="Estado civil" value={formData.estadoCivil} />
        <Row label="Tipo de declaración" value={formData.declaracionTipo === 'conjunta' ? 'Conjunta' : 'Individual'} />
        {formData.declaracionTipo === 'conjunta' && (
          <>
            <Row label="Cónyuge — Nombre" value={formData.conyuge.nombre} />
            <Row label="Cónyuge — NIF" value={formData.conyuge.nif} />
          </>
        )}
        <Row label="Domicilio" value={domicilioTexto} />
        <Row label="Teléfono" value={formData.telefono} />
        <Row label="Email" value={formData.email} />
        <Row label="Cambio de domicilio" value={yesNo(formData.cambioDomicilio)} />
      </Section>

      <Section title="2. Situación familiar">
        <Row label="Hijos a cargo" value={formData.tieneHijos ? (hijosTexto || 'Sí (sin detalle)') : 'No'} />
        <Row label="Ascendientes a cargo" value={formData.tieneAscendientes ? (ascendientesTexto || 'Sí (sin detalle)') : 'No'} />
        <Row label="Discapacidad propia" value={formData.tieneDiscapacidad ? `Sí — ${formData.porcentajeDiscapacidad}%` : 'No'} />
        <Row label="Pensionista de viudedad" value={yesNo(formData.esPensionistaViudedad)} />
      </Section>

      <Section title="3. Ingresos y retenciones">
        <Row label="Nóminas" value={formData.tieneNominas
          ? `Sí — ${formData.numeroPagadores} pagador(es) · Bruto: ${formData.importeBrutoTotal} € · Retenciones: ${formData.retencionesTotal} €`
          : 'No'} />
        <Row label="Prestación por desempleo" value={formData.tieneDesempleo ? `Sí — ${formData.importeDesempleo} €` : 'No'} />
        <Row label="Pensión" value={formData.tienePension ? `Sí (${formData.tipoPension}) — ${formData.importePension} €` : 'No'} />
        <Row label="Ingresos como autónomo" value={formData.tieneAutonomo
          ? `Sí — ${formData.regimenEstimacion} · Ingresos: ${formData.ingresosAutonomo} € · Gastos: ${formData.gastosAutonomo} €`
          : 'No'} />
        <Row label="Inmuebles alquilados" value={formData.tieneAlquiler
          ? `Sí — Ingresos: ${formData.ingresosAlquiler} € · Gastos: ${formData.gastosAlquiler} €`
          : 'No'} />
        <Row label="Ganancias/pérdidas patrimoniales" value={formData.tieneGanancias ? `Sí — ${formData.descripcionGanancias}` : 'No'} />
        <Row label="Capital mobiliario" value={formData.tieneCapitalMobiliario ? `Sí — ${formData.importeCapitalMobiliario} €` : 'No'} />
      </Section>

      <Section title="4. Deducciones">
        <Row label="Vivienda habitual antes 2013" value={yesNo(formData.viviendaHabitual2013)} />
        <Row label="Plan de pensiones" value={formData.tienePlanPensiones ? `Sí — ${formData.importePlanPensiones} €` : 'No'} />
        <Row label="Donativos" value={formData.tieneDonativos ? `Sí — ${formData.importeDonativos} €` : 'No'} />
        <Row label="Alquiler vivienda (contrato antes 2015)" value={yesNo(formData.alquilerAntes2015)} />
        <Row label="Devolución cláusula suelo" value={yesNo(formData.clausulaSupelo)} />
        <Row label="Provincia para deducciones autonómicas" value={formData.domicilio.provincia} />
      </Section>

      <Section title="5. Documentación adjunta">
        <Row label="DNI/NIE anverso" value={formData.dniAnverso ? `✓ ${formData.dniAnverso.name}` : 'No adjuntado'} />
        <Row label="DNI/NIE reverso" value={formData.dniReverso ? `✓ ${formData.dniReverso.name}` : 'No adjuntado'} />
        <Row label="Borrador Hacienda" value={formData.borradorHacienda ? `✓ ${formData.borradorHacienda.name}` : 'No adjuntado'} />
        <Row label="Cert. retenciones 1" value={formData.certificadoRetencion1 ? `✓ ${formData.certificadoRetencion1.name}` : 'No adjuntado'} />
        <Row label="Cert. retenciones 2" value={formData.certificadoRetencion2 ? `✓ ${formData.certificadoRetencion2.name}` : 'No adjuntado'} />
        <Row label="Cert. retenciones 3" value={formData.certificadoRetencion3 ? `✓ ${formData.certificadoRetencion3.name}` : 'No adjuntado'} />
      </Section>

      {/* Privacidad */}
      <div
        className={`${styles.checkboxRow} ${formData.privacidad ? styles.checked : ''}`}
        onClick={() => onChange({ privacidad: !formData.privacidad })}
      >
        <div className={styles.checkbox}>{formData.privacidad && '✓'}</div>
        <span className={styles.checkboxLabel}>
          He leído y acepto la{' '}
          <a
            href="https://ecomsolutions.es/politica-de-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'var(--color-blue)', fontWeight: 600 }}
          >
            política de privacidad
          </a>{' '}
          y autorizo a EcomSolutions a tratar mis datos para la gestión de mi declaración de la renta.
        </span>
      </div>
      {errors.includes('privacidad') && (
        <div className={styles.errorMsg}>⚠ Debes aceptar la política de privacidad antes de enviar.</div>
      )}

      <div className={styles.infoNote}>
        <span className={styles.infoNoteIcon}>🔒</span>
        Tus datos se tratan de forma confidencial conforme al RGPD y solo se usarán para
        preparar tu declaración de la renta.
      </div>
    </div>
  );
}
