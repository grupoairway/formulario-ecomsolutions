'use client';

import { RentaFormData } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

export default function RentaStep04Deducciones({ formData, onChange }: Props) {
  const provincia = formData.domicilio.provincia || 'tu comunidad autónoma';

  return (
    <div>
      <div className={styles.infoNote} style={{ marginBottom: 24 }}>
        <span className={styles.infoNoteIcon}>ℹ️</span>
        <span>
          Las deducciones reducen la cuota del IRPF. Responde solo a las que te apliquen;
          aplicaremos automáticamente las deducciones autonómicas de <strong>{provincia}</strong>.
        </span>
      </div>

      {/* Vivienda habitual antes de 2013 */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Adquirió su vivienda habitual antes del 1 de enero de 2013?
        </label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>
          (Deducción transitoria por inversión en vivienda habitual)
        </div>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.viviendaHabitual2013 === true ? styles.selected : ''}`}
            onClick={() => onChange({ viviendaHabitual2013: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.viviendaHabitual2013 === false ? styles.selected : ''}`}
            onClick={() => onChange({ viviendaHabitual2013: false })}
          >
            No
          </label>
        </div>
      </div>

      {/* Plan de pensiones */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Ha realizado aportaciones a un plan de pensiones o mutualidad de previsión social?
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tienePlanPensiones === true ? styles.selected : ''}`}
            onClick={() => onChange({ tienePlanPensiones: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tienePlanPensiones === false ? styles.selected : ''}`}
            onClick={() => onChange({ tienePlanPensiones: false, importePlanPensiones: '' })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tienePlanPensiones === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe aportado durante el ejercicio (€)</label>
          <input
            type="number"
            min="0"
            className={styles.input}
            placeholder="Ej: 2000"
            value={formData.importePlanPensiones}
            onChange={(e) => onChange({ importePlanPensiones: e.target.value })}
          />
        </div>
      )}

      {/* Donativos */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Ha realizado donativos a ONGs, fundaciones u otras entidades sin ánimo de lucro?
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneDonativos === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneDonativos: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneDonativos === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneDonativos: false, importeDonativos: '' })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneDonativos === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe total de donativos (€)</label>
          <input
            type="number"
            min="0"
            className={styles.input}
            placeholder="Ej: 300"
            value={formData.importeDonativos}
            onChange={(e) => onChange({ importeDonativos: e.target.value })}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>
            Conserva los justificantes de los donativos para acreditar la deducción.
          </div>
        </div>
      )}

      {/* Alquiler vivienda habitual antes de 2015 */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Paga alquiler de vivienda habitual con contrato anterior al 1 de enero de 2015?
        </label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>
          (Deducción estatal transitoria por alquiler de vivienda habitual)
        </div>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.alquilerAntes2015 === true ? styles.selected : ''}`}
            onClick={() => onChange({ alquilerAntes2015: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.alquilerAntes2015 === false ? styles.selected : ''}`}
            onClick={() => onChange({ alquilerAntes2015: false })}
          >
            No
          </label>
        </div>
      </div>

      {/* Cláusula suelo */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Ha recibido en el ejercicio una devolución de cantidades por cláusula suelo de su hipoteca?
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.clausulaSupelo === true ? styles.selected : ''}`}
            onClick={() => onChange({ clausulaSupelo: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.clausulaSupelo === false ? styles.selected : ''}`}
            onClick={() => onChange({ clausulaSupelo: false })}
          >
            No
          </label>
        </div>
      </div>

      <div className={styles.infoNote} style={{ marginTop: 8 }}>
        <span className={styles.infoNoteIcon}>📍</span>
        <span>
          Tu provincia de residencia es <strong>{provincia}</strong>. Aplicaremos también las
          deducciones autonómicas que te correspondan al preparar tu declaración.
        </span>
      </div>
    </div>
  );
}
