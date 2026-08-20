'use client';

import { AutonomoFormData } from '@/lib/types-autonomo';
import { minInicioActividad, maxInicioActividad, INICIO_DIAS_ADELANTE } from '@/lib/fechas';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: AutonomoFormData;
  onChange: (updates: Partial<AutonomoFormData>) => void;
  errors: string[];
}

export default function AutoStep02Actividad({ formData, onChange, errors }: Props) {
  const { descripcionActividad, fechaInicio, cuantoAntes, roi } = formData;

  return (
    <div>
      {/* Descripción actividad */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Describe brevemente tu actividad <span className={styles.required}>*</span>
        </label>
        <textarea
          className={`${styles.textarea} ${errors.includes('descripcionActividad') ? styles.error : ''}`}
          placeholder="Ej: Diseño gráfico y desarrollo web para empresas, venta online de productos artesanales..."
          rows={4}
          value={descripcionActividad}
          onChange={(e) => onChange({ descripcionActividad: e.target.value })}
        />
        {errors.includes('descripcionActividad') && (
          <div className={styles.errorMsg}>⚠ Describe la actividad que vas a ejercer.</div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          No necesitas saber el epígrafe IAE: nuestro gestor lo asignará a partir de tu descripción.
        </div>
      </div>

      {/* Fecha de inicio */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Fecha de inicio de actividad <span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.checkboxRow} ${cuantoAntes ? styles.checked : ''}`}
          style={{ marginBottom: 12 }}
          onClick={() => onChange({ cuantoAntes: !cuantoAntes, fechaInicio: '' })}
        >
          <div className={styles.checkbox}>{cuantoAntes && '✓'}</div>
          <span className={styles.checkboxLabel}>Quiero darme de alta cuanto antes posible</span>
        </div>
        {!cuantoAntes && (
          <input
            type="date"
            min={minInicioActividad()}
            max={maxInicioActividad()}
            className={`${styles.input} ${errors.some((e) => e.startsWith('fechaInicio')) ? styles.error : ''}`}
            value={fechaInicio}
            onChange={(e) => onChange({ fechaInicio: e.target.value })}
          />
        )}
        {errors.includes('fechaInicio') && (
          <div className={styles.errorMsg}>⚠ Selecciona la fecha de inicio o marca &ldquo;cuanto antes&rdquo;.</div>
        )}
        {errors.includes('fechaInicio_formato') && (
          <div className={styles.errorMsg}>⚠ La fecha no es válida. Revisa que el año tenga 4 cifras.</div>
        )}
        {errors.includes('fechaInicio_rango') && (
          <div className={styles.errorMsg}>
            ⚠ El alta se tramita con un máximo de {INICIO_DIAS_ADELANTE} días de antelación.
            Elige una fecha más cercana o marca &ldquo;cuanto antes&rdquo;.
          </div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          La fecha de alta en Hacienda y Seguridad Social debe coordinarse para evitar
          cuotas innecesarias. Nuestro equipo te asesora sobre el mejor momento.
        </div>
      </div>

      {/* ROI */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Necesitas el ROI (Registro de Operadores Intracomunitarios)? <span className={styles.required}>*</span>
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
          <div className={styles.errorMsg}>⚠ Indica si necesitas el ROI.</div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          El ROI te permite comprar y vender a empresas de otros países de la UE sin IVA.
          Es obligatorio si vas a operar con clientes o proveedores intracomunitarios (alemanes,
          franceses, holandeses...). Si tienes dudas, te lo aclaramos.
        </div>
      </div>

    </div>
  );
}
