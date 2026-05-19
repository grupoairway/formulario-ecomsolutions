'use client';

import { FormData } from '@/lib/types';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

export default function Step02Empresa({ formData, onChange, errors }: Props) {
  const { actividad, roi, fechaInicioActividad } = formData;

  return (
    <div>
      {/* Actividad */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Describe la actividad de tu sociedad <span className={styles.required}>*</span>
        </label>
        <textarea
          className={`${styles.textarea} ${errors.includes('actividad') ? styles.error : ''}`}
          placeholder="Ej: Comercio electrónico de productos tecnológicos, consultoría de marketing digital..."
          rows={4}
          value={actividad}
          onChange={(e) => onChange({ actividad: e.target.value })}
        />
        {errors.includes('actividad') && (
          <div className={styles.errorMsg}>⚠ Describe la actividad de la sociedad.</div>
        )}
      </div>

      {/* ROI */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Vas a operar intracomunitariamente (ROI)? <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${roi === true ? styles.selected : ''}`}
            onClick={() => onChange({ roi: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${roi === false ? styles.selected : ''}`}
            onClick={() => onChange({ roi: false })}
          >
            No
          </label>
        </div>
        {errors.includes('roi') && (
          <div className={styles.errorMsg}>⚠ Indica si operarás intracomunitariamente.</div>
        )}
        {roi === true && (
          <div className={styles.infoNote}>
            <span className={styles.infoNoteIcon}>ℹ️</span>
            Las compras/ventas entre operadores intracomunitarios no aplican IVA.
          </div>
        )}
      </div>

      {/* Fecha inicio actividad */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Fecha de inicio de actividad (opcional)</label>
        <input
          type="date"
          className={styles.input}
          value={fechaInicioActividad}
          onChange={(e) => onChange({ fechaInicioActividad: e.target.value })}
        />
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          Si quieres operar desde el momento de constitución, déjalo en blanco.
        </div>
      </div>
    </div>
  );
}
