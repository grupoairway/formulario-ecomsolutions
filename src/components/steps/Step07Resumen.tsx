'use client';

import { useState } from 'react';
import { FormData } from '@/lib/types';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.resumenSection}>
      <div className={styles.resumenHeader} onClick={() => setOpen(!open)}>
        <span className={styles.resumenHeaderTitle}>{title}</span>
        <span className={`${styles.resumenChevron} ${open ? styles.resumenChevronOpen : ''}`}>
          ▼
        </span>
      </div>
      {open && <div className={styles.resumenBody}>{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined | null | boolean }) {
  if (value === undefined || value === null || value === '') return null;
  const display =
    typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value;
  return (
    <div className={styles.resumenRow}>
      <span className={styles.resumenKey}>{label}</span>
      <span className={styles.resumenVal}>{display}</span>
    </div>
  );
}

function getNombreSociedad(formData: FormData): string {
  if (formData.metodoDenominacion === 'nuevo') return formData.denominaciones[0] || '—';
  if (formData.metodoDenominacion === 'bolsa') return formData.nombreBolsa || '—';
  return formData.denominacionCertificada || '—';
}

function capitalDinerario(formData: FormData): string {
  let total = 0;
  for (const s of formData.socios) {
    if (s.tipoAportacion === 'dineraria_acreditada' || s.tipoAportacion === 'dineraria_no_acreditada') {
      const v = parseFloat(s.aportacion.replace(',', '.'));
      if (!isNaN(v)) total += v;
    }
  }
  return total.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + '€';
}

const METODO_LABEL: Record<string, string> = {
  nuevo: 'Nombre nuevo',
  bolsa: 'Bolsa del Registro Mercantil',
  certificado: 'Certificado de denominación',
};

const APORTACION_LABEL: Record<string, string> = {
  dineraria_acreditada: 'Dineraria acreditada',
  no_dineraria: 'No dineraria',
  dineraria_no_acreditada: 'Dineraria no acreditada',
};

export default function Step07Resumen({ formData, onChange, errors }: Props) {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Revisa todos los datos antes de enviar. Si necesitas corregir algo, usa el botón
        &ldquo;Anterior&rdquo; para volver al paso correspondiente.
      </p>

      {/* Denominación */}
      <Section title="1. Denominación social">
        <Row label="Método" value={METODO_LABEL[formData.metodoDenominacion] ?? formData.metodoDenominacion} />
        {formData.metodoDenominacion === 'nuevo' &&
          formData.denominaciones
            .filter(Boolean)
            .map((d, i) => <Row key={i} label={`Opción ${i + 1}`} value={d} />)}
        {formData.metodoDenominacion === 'bolsa' && (
          <Row label="Nombre de la bolsa" value={formData.nombreBolsa} />
        )}
        {formData.metodoDenominacion === 'certificado' && (
          <Row label="Denominación certificada" value={formData.denominacionCertificada} />
        )}
      </Section>

      {/* Empresa */}
      <Section title="2. Información de la empresa">
        <Row label="Actividad" value={formData.actividad} />
        <Row label="ROI intracomunitario" value={formData.roi} />
        {formData.fechaInicioActividad && (
          <Row label="Inicio de actividad" value={formData.fechaInicioActividad} />
        )}
      </Section>

      {/* Domicilio */}
      <Section title="3. Domicilio social">
        <Row label="Dirección" value={formData.domicilio.direccion} />
        <Row label="Municipio" value={formData.domicilio.municipio} />
        <Row label="Código postal" value={formData.domicilio.codigoPostal} />
        <Row label="Provincia" value={formData.domicilio.provincia} />
        <Row label="Superficie" value={formData.domicilio.superficie ? `${formData.domicilio.superficie} m²` : ''} />
        <Row label="% actividad" value={formData.domicilio.porcentajeActividad ? `${formData.domicilio.porcentajeActividad}%` : ''} />
      </Section>

      {/* Centro actividad */}
      <Section title="4. Centro de actividad">
        <Row
          label="¿Mismo que domicilio?"
          value={formData.mismoCentroActividad === null ? '—' : formData.mismoCentroActividad}
        />
        {formData.mismoCentroActividad === false && (
          <>
            <Row label="Dirección" value={formData.centroActividad.direccion} />
            <Row label="Municipio" value={formData.centroActividad.municipio} />
            <Row label="Código postal" value={formData.centroActividad.codigoPostal} />
            <Row label="Provincia" value={formData.centroActividad.provincia} />
          </>
        )}
      </Section>

      {/* Socios */}
      <Section title="5. Socios">
        {formData.socios.map((s, i) => (
          <div key={s.id} style={{ marginBottom: i < formData.socios.length - 1 ? 16 : 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: 'var(--color-text)' }}>
              Socio {i + 1}
            </div>
            <Row
              label="Nombre"
              value={[s.nombre, s.primerApellido, s.segundoApellido].filter(Boolean).join(' ')}
            />
            <Row label="Email" value={s.email} />
            <Row label="Documento" value={s.documento} />
            <Row label="Nacionalidad" value={s.nacionalidad} />
            <Row label="Estado civil" value={s.estadoCivil} />
            <Row label="Aportación" value={APORTACION_LABEL[s.tipoAportacion] ?? ''} />
            <Row
              label="Importe / bienes"
              value={
                s.tipoAportacion !== 'no_dineraria' && s.aportacion
                  ? `${parseFloat(s.aportacion || '0').toLocaleString('es-ES')}€`
                  : s.aportacion
              }
            />
          </div>
        ))}
        <div style={{ marginTop: 12, padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
          <Row label="Capital social total" value={capitalDinerario(formData)} />
        </div>
      </Section>

      {/* Administradores */}
      <Section title="6. Administradores">
        <Row label="Tipo administración" value={formData.tipoAdministracion} />
        {formData.administradores.map((a, i) => (
          <div key={a.id} style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: 'var(--color-text)' }}>
              Administrador {i + 1}
            </div>
            <Row
              label="Nombre"
              value={[a.nombre, a.apellidos].filter(Boolean).join(' ')}
            />
            <Row label="Documento" value={a.documento} />
            <Row label="Retribución" value={a.cobranRetribucion} />
            {a.cobranRetribucion && a.tipoRetribucion && (
              <Row
                label="Tipo retribución"
                value={
                  a.tipoRetribucion === 'porcentual' && a.porcentajeRetribucion
                    ? `Porcentual (${a.porcentajeRetribucion}%)`
                    : 'Fija'
                }
              />
            )}
            <Row label="Autónomo societario" value={a.esAutonomoSocietario} />
            {a.esAutonomoSocietario && <Row label="Mutua" value={a.mutua} />}
            {a.esAutonomoSocietario && <Row label="IBAN" value={a.iban} />}
            {a.esAutonomoSocietario && a.tarifaReducida !== null && (
              <Row label="Tarifa reducida" value={a.tarifaReducida} />
            )}
          </div>
        ))}
      </Section>

      {/* Confirmación */}
      <div
        className={`${styles.checkboxRow} ${formData.confirmacion ? styles.checked : ''}`}
        onClick={() => onChange({ confirmacion: !formData.confirmacion })}
      >
        <div className={styles.checkbox}>{formData.confirmacion && '✓'}</div>
        <span className={styles.checkboxLabel}>
          Confirmo que los datos son correctos y autorizo a EcomSolutions a tramitar la
          constitución de la Sociedad Limitada.
        </span>
      </div>
      {errors.includes('confirmacion') && (
        <div className={styles.errorMsg}>⚠ Debes confirmar los datos antes de enviar.</div>
      )}

      <div className={styles.infoNote}>
        <span className={styles.infoNoteIcon}>🔒</span>
        Tus datos se tratan de forma confidencial conforme al RGPD y solo se usarán para
        gestionar la constitución de tu sociedad.
      </div>
    </div>
  );
}
