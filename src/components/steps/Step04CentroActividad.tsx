'use client';

import { FormData } from '@/lib/types';
import { LocalDomicilioForm } from './DireccionForm';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

export default function Step04CentroActividad({ formData, onChange, errors }: Props) {
  const { mismoCentroActividad, centroActividad, domicilio } = formData;

  const d = domicilio.direccion;
  const resumenSocial = [
    [d.tipoVia, d.nombreVia, d.numero].filter(Boolean).join(' '),
    d.municipio,
    d.provincia,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿El centro de actividad es el mismo que el domicilio social?{' '}
          <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${mismoCentroActividad === true ? styles.selected : ''}`}
            onClick={() => onChange({ mismoCentroActividad: true })}
          >
            Sí, es el mismo
          </label>
          <label
            className={`${styles.radioBtn} ${mismoCentroActividad === false ? styles.selected : ''}`}
            onClick={() => onChange({ mismoCentroActividad: false })}
          >
            No, es diferente
          </label>
        </div>
        {errors.includes('mismoCentroActividad') && (
          <div className={styles.errorMsg}>⚠ Indica si el centro de actividad coincide con el domicilio.</div>
        )}
      </div>

      {mismoCentroActividad === true && (
        <div className={styles.infoNote}>
          <span className={styles.infoNoteIcon}>✅</span>
          El centro de actividad será:{' '}
          <strong>{resumenSocial || 'el domicilio social indicado en el paso anterior'}</strong>
        </div>
      )}

      {mismoCentroActividad === false && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 20 }}>
            Introduce los datos del centro de actividad alternativo:
          </p>
          <LocalDomicilioForm
            data={centroActividad}
            onChange={(updates) =>
              onChange({ centroActividad: { ...centroActividad, ...updates } })
            }
            prefix="centro_"
            errors={errors}
          />
        </div>
      )}
    </div>
  );
}
