'use client';

import { FormData } from '@/lib/types';
import { hoyMasDias } from '@/lib/fechas';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

export default function Step02Empresa({ formData, onChange, errors }: Props) {
  const {
    actividadPrincipal,
    actividadesSecundarias,
    roi,
    fechaInicioActividad,
    cierreEjercicio,
    duracionSociedad,
    duracionAnios,
  } = formData;

  function updateSecundaria(index: number, value: string) {
    const next = actividadesSecundarias.map((a, i) => (i === index ? value : a));
    onChange({ actividadesSecundarias: next });
  }

  function addSecundaria() {
    onChange({ actividadesSecundarias: [...actividadesSecundarias, ''] });
  }

  function removeSecundaria(index: number) {
    onChange({ actividadesSecundarias: actividadesSecundarias.filter((_, i) => i !== index) });
  }

  return (
    <div>
      {/* Actividad principal */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Actividad principal <span className={styles.required}>*</span>
        </label>
        <textarea
          className={`${styles.textarea} ${errors.includes('actividadPrincipal') ? styles.error : ''}`}
          placeholder="Describe en lenguaje natural qué hará la empresa. Ej: restaurante, comercio electrónico de ropa, consultoría de marketing..."
          rows={3}
          value={actividadPrincipal}
          onChange={(e) => onChange({ actividadPrincipal: e.target.value })}
        />
        {errors.includes('actividadPrincipal') && (
          <div className={styles.errorMsg}>⚠ Describe la actividad principal de la sociedad.</div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          No necesitas saber el código CNAE/IAE: nuestro gestor lo asignará a partir de tu descripción.
        </div>
      </div>

      {/* Actividades secundarias */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Actividades secundarias (opcional)</label>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: -4, marginBottom: 12 }}>
          Añade otras actividades que también vaya a realizar la sociedad, si las hay.
        </p>

        {actividadesSecundarias.map((act, i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}
          >
            <input
              type="text"
              className={styles.input}
              placeholder={`Actividad secundaria ${i + 1}`}
              value={act}
              onChange={(e) => updateSecundaria(i, e.target.value)}
            />
            <button
              type="button"
              className={styles.btnRemove}
              onClick={() => removeSecundaria(i)}
              style={{ flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        ))}

        <button type="button" className={styles.btnAdd} onClick={addSecundaria}>
          + Añadir actividad secundaria
        </button>
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

      {/* Cierre de ejercicio */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Cierre de ejercicio <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes('cierreEjercicio') ? styles.error : ''}`}
          placeholder="31/12"
          value={cierreEjercicio}
          onChange={(e) => onChange({ cierreEjercicio: e.target.value })}
        />
        {errors.includes('cierreEjercicio') && (
          <div className={styles.errorMsg}>⚠ Indica la fecha de cierre de ejercicio.</div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          Lo habitual es el 31/12. Cámbialo solo si tu sociedad cerrará el ejercicio en otra fecha.
        </div>
      </div>

      {/* Duración de la sociedad */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Duración de la sociedad <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${duracionSociedad === 'indefinida' ? styles.selected : ''}`}
            onClick={() => onChange({ duracionSociedad: 'indefinida', duracionAnios: '' })}
          >
            Indefinida
          </label>
          <label
            className={`${styles.radioBtn} ${duracionSociedad === 'determinada' ? styles.selected : ''}`}
            onClick={() => onChange({ duracionSociedad: 'determinada' })}
          >
            Determinada
          </label>
        </div>
        {duracionSociedad === 'determinada' && (
          <div style={{ marginTop: 12 }}>
            <label className={styles.label}>
              Número de años <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              min="1"
              className={`${styles.input} ${errors.includes('duracionAnios') ? styles.error : ''}`}
              placeholder="Ej: 50"
              value={duracionAnios}
              onChange={(e) => onChange({ duracionAnios: e.target.value })}
            />
            {errors.includes('duracionAnios') && (
              <div className={styles.errorMsg}>⚠ Indica el número de años.</div>
            )}
          </div>
        )}
      </div>

      {/* Fecha inicio actividad */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Fecha de inicio de actividad (opcional)</label>
        <input
          type="date"
          min={hoyMasDias(-30)}
          max={hoyMasDias(365)}
          className={`${styles.input} ${errors.includes('fechaInicioActividad') ? styles.error : ''}`}
          value={fechaInicioActividad}
          onChange={(e) => onChange({ fechaInicioActividad: e.target.value })}
        />
        {errors.includes('fechaInicioActividad') && (
          <div className={styles.errorMsg}>
            ⚠ La fecha no es válida. Revisa que el año tenga 4 cifras y que esté dentro
            del próximo año.
          </div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          Si quieres operar desde el momento de constitución, déjalo en blanco.
        </div>
      </div>
    </div>
  );
}
