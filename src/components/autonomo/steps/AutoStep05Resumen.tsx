'use client';

import { useState } from 'react';
import { AutonomoFormData } from '@/lib/types-autonomo';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: AutonomoFormData;
  onChange: (updates: Partial<AutonomoFormData>) => void;
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

export default function AutoStep05Resumen({ formData, onChange, errors }: Props) {
  const { domicilio, centroActividad } = formData;

  const domicilioTexto = [
    domicilio.calle,
    domicilio.numero,
    domicilio.piso,
    domicilio.cp,
    domicilio.municipio,
    domicilio.provincia,
  ]
    .filter(Boolean)
    .join(', ');

  const centroTexto =
    formData.mismoCentroActividad === true
      ? 'Mismo que el domicilio particular'
      : [centroActividad.direccion, centroActividad.cp, centroActividad.municipio, centroActividad.provincia]
          .filter(Boolean)
          .join(', ');

  const tieneReducida = formData.noAltaDosAnios && formData.sinDeudasSS;

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Revisa todos los datos antes de enviar. Si necesitas corregir algo, usa el botón
        &ldquo;Anterior&rdquo; para volver al paso correspondiente.
      </p>

      <Section title="1. Datos personales">
        <Row label="Nombre completo" value={formData.nombreCompleto} />
        <Row label="Fecha de nacimiento" value={formData.fechaNacimiento} />
        <Row label="Nacionalidad" value={formData.nacionalidad} />
        <Row
          label="Tipo documento"
          value={
            formData.tipoDocumento === 'dni'
              ? 'DNI'
              : formData.tipoDocumento === 'nie_comunitario'
              ? 'NIE comunitario'
              : formData.tipoDocumento === 'nie_extracomunitario'
              ? 'NIE extracomunitario'
              : ''
          }
        />
        <Row label="Número documento" value={formData.numeroDocumento} />
        <Row label="Domicilio" value={domicilioTexto} />
        <Row label="Centro de actividad" value={centroTexto} />
        {formData.mismoCentroActividad === false && formData.centroActividad.m2 && (
          <Row label="m² actividad" value={`${formData.centroActividad.m2} m²`} />
        )}
        <Row label="Teléfono" value={formData.telefono} />
        <Row label="Email" value={formData.email} />
        <Row label="Estado civil" value={formData.estadoCivil} />
        {formData.fechaEstadoCivil && (
          <Row label="Fecha estado civil" value={formData.fechaEstadoCivil} />
        )}
      </Section>

      <Section title="2. Actividad">
        <Row label="Descripción" value={formData.descripcionActividad} />
        <Row
          label="Fecha de inicio"
          value={formData.cuantoAntes ? 'Cuanto antes posible' : formData.fechaInicio}
        />
        <Row label="ROI intracomunitario" value={formData.roi} />
        <Row label="Epígrafe IAE" value={formData.epigrafeIAE} />
      </Section>

      <Section title="3. Seguridad Social">
        {formData.numeroAfiliacionSS && (
          <Row label="Nº afiliación SS" value={formData.numeroAfiliacionSS} />
        )}
        <Row label="Mutua" value={formData.mutua} />
        <Row label="IBAN domiciliación" value={formData.iban} />
        <Row label="Ingresos netos estimados" value={formData.ingresosNetos ? `${formData.ingresosNetos} €/mes` : ''} />
        <Row
          label="Tarifa reducida (80€)"
          value={tieneReducida ? 'Cumple requisitos' : 'No cumple requisitos'}
        />
      </Section>

      <Section title="4. Documentación">
        <Row
          label="DNI/NIE anverso"
          value={formData.dniAnverso ? `✓ ${formData.dniAnverso.name}` : 'No adjuntado'}
        />
        <Row
          label="DNI/NIE reverso"
          value={formData.dniReverso ? `✓ ${formData.dniReverso.name}` : 'No adjuntado'}
        />
        {formData.tipoDocumento === 'nie_extracomunitario' && (
          <Row
            label="Permiso de trabajo"
            value={formData.permisoTrabajo ? `✓ ${formData.permisoTrabajo.name}` : 'No adjuntado'}
          />
        )}
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
          y autorizo a EcomSolutions a tramitar mi alta como autónomo con los datos facilitados.
        </span>
      </div>
      {errors.includes('privacidad') && (
        <div className={styles.errorMsg}>⚠ Debes aceptar la política de privacidad antes de enviar.</div>
      )}

      <div className={styles.infoNote}>
        <span className={styles.infoNoteIcon}>🔒</span>
        Tus datos se tratan de forma confidencial conforme al RGPD y solo se usarán para
        gestionar el alta de autónomo.
      </div>
    </div>
  );
}
