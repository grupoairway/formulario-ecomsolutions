'use client';

import { RentaFormData } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function SiNo({ value, onTrue, onFalse }: { value: boolean | null; onTrue: () => void; onFalse: () => void }) {
  return (
    <div className={styles.radioInline}>
      <label className={`${styles.radioBtn} ${value === true ? styles.selected : ''}`} onClick={onTrue}>Sí</label>
      <label className={`${styles.radioBtn} ${value === false ? styles.selected : ''}`} onClick={onFalse}>No</label>
    </div>
  );
}

export default function RentaStep05OtrasSituaciones({ formData, onChange }: Props) {
  const ej = formData.ejercicioFiscal || '2025';

  return (
    <div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha residido fuera de España en algún momento de {ej}?</label>
        <SiNo
          value={formData.residioFueraEspana}
          onTrue={() => onChange({ residioFueraEspana: true })}
          onFalse={() => onChange({ residioFueraEspana: false })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha trabajado o prestado servicios fuera de España?</label>
        <SiNo
          value={formData.trabajoFueraEspana}
          onTrue={() => onChange({ trabajoFueraEspana: true })}
          onFalse={() => onChange({ trabajoFueraEspana: false })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha fallecido algún familiar en {ej}?</label>
        <SiNo
          value={formData.fallecioFamiliar}
          onTrue={() => onChange({ fallecioFamiliar: true })}
          onFalse={() => onChange({ fallecioFamiliar: false })}
        />
        {formData.fallecioFamiliar === true && (
          <div className={styles.infoNote} style={{ marginTop: 8 }}>
            <span className={styles.infoNoteIcon}>ℹ️</span>
            <span>Si el fallecido era declarante, el período impositivo finaliza en la fecha del fallecimiento. Indícalo en el campo de observaciones.</span>
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha recibido algún requerimiento, notificación o carta de la AEAT en {ej}?</label>
        <SiNo
          value={formData.recibioPRequerimiento}
          onTrue={() => onChange({ recibioPRequerimiento: true })}
          onFalse={() => onChange({ recibioPRequerimiento: false })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene bases imponibles negativas de ejercicios anteriores pendientes de compensar?</label>
        <SiNo
          value={formData.tieneBasesNegativas}
          onTrue={() => onChange({ tieneBasesNegativas: true })}
          onFalse={() => onChange({ tieneBasesNegativas: false, importeBasesNegativas: '' })}
        />
        {formData.tieneBasesNegativas === true && (
          <div className={styles.fieldGroup} style={{ marginTop: 12 }}>
            <label className={styles.label}>Importe total de las bases negativas (€)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej: 3.200"
              value={formData.importeBasesNegativas}
              onChange={(e) => onChange({ importeBasesNegativas: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Realiza operaciones vinculadas con sociedades propias o familiares?</label>
        <SiNo
          value={formData.tieneOperacionesVinculadas}
          onTrue={() => onChange({ tieneOperacionesVinculadas: true })}
          onFalse={() => onChange({ tieneOperacionesVinculadas: false })}
        />
        {formData.tieneOperacionesVinculadas === true && (
          <div className={styles.infoNote} style={{ marginTop: 8 }}>
            <span className={styles.infoNoteIcon}>ℹ️</span>
            <span>Deberá documentar las operaciones conforme al valor de mercado (art. 18 LIS). Indique detalles en el campo de observaciones.</span>
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Cualquier otra situación especial que debamos conocer</label>
        <textarea
          className={styles.input}
          rows={4}
          placeholder="Describe aquí cualquier situación especial: divorcios, acuerdos judiciales, herencias, regularizaciones previas, etc."
          value={formData.otrasSituaciones}
          onChange={(e) => onChange({ otrasSituaciones: e.target.value })}
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div className={styles.infoNote}>
        <span className={styles.infoNoteIcon}>ℹ️</span>
        <span>Estos datos nos ayudan a identificar posibles obligaciones adicionales o particularidades en tu declaración.</span>
      </div>
    </div>
  );
}
