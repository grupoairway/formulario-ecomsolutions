'use client';

import { DomicilioFields, FormData, PROVINCIAS } from '@/lib/types';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

interface DomicilioFormProps {
  data: DomicilioFields;
  onChange: (updates: Partial<DomicilioFields>) => void;
  prefix: string;
  errors: string[];
}

export function DomicilioForm({ data, onChange, prefix, errors }: DomicilioFormProps) {
  return (
    <div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Provincia <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.select} ${errors.includes(`${prefix}provincia`) ? styles.error : ''}`}
          value={data.provincia}
          onChange={(e) => onChange({ provincia: e.target.value })}
        >
          <option value="">Selecciona provincia</option>
          {PROVINCIAS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {errors.includes(`${prefix}provincia`) && (
          <div className={styles.errorMsg}>⚠ Selecciona la provincia.</div>
        )}
      </div>

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Municipio <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.includes(`${prefix}municipio`) ? styles.error : ''}`}
            placeholder="Ciudad o municipio"
            value={data.municipio}
            onChange={(e) => onChange({ municipio: e.target.value })}
          />
          {errors.includes(`${prefix}municipio`) && (
            <div className={styles.errorMsg}>⚠ Introduce el municipio.</div>
          )}
        </div>
        <div>
          <label className={styles.label}>
            Código postal <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.includes(`${prefix}codigoPostal`) ? styles.error : ''}`}
            placeholder="00000"
            maxLength={5}
            value={data.codigoPostal}
            onChange={(e) => onChange({ codigoPostal: e.target.value.replace(/\D/g, '') })}
          />
          {errors.includes(`${prefix}codigoPostal`) && (
            <div className={styles.errorMsg}>⚠ Introduce el código postal (5 dígitos).</div>
          )}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Dirección completa <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes(`${prefix}direccion`) ? styles.error : ''}`}
          placeholder="Calle, número, piso, puerta..."
          value={data.direccion}
          onChange={(e) => onChange({ direccion: e.target.value })}
        />
        {errors.includes(`${prefix}direccion`) && (
          <div className={styles.errorMsg}>⚠ Introduce la dirección completa.</div>
        )}
      </div>

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Superficie total (m²) <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            min="1"
            className={`${styles.input} ${errors.includes(`${prefix}superficie`) ? styles.error : ''}`}
            placeholder="0"
            value={data.superficie}
            onChange={(e) => onChange({ superficie: e.target.value })}
          />
          {errors.includes(`${prefix}superficie`) && (
            <div className={styles.errorMsg}>⚠ Introduce la superficie.</div>
          )}
        </div>
        <div>
          <label className={styles.label}>
            % usado para la actividad <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            min="1"
            max="100"
            className={`${styles.input} ${errors.includes(`${prefix}porcentajeActividad`) ? styles.error : ''}`}
            placeholder="100"
            value={data.porcentajeActividad}
            onChange={(e) => onChange({ porcentajeActividad: e.target.value })}
          />
          {errors.includes(`${prefix}porcentajeActividad`) && (
            <div className={styles.errorMsg}>⚠ Introduce el porcentaje (1–100).</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Step03Domicilio({ formData, onChange, errors }: Props) {
  return (
    <DomicilioForm
      data={formData.domicilio}
      onChange={(updates) => onChange({ domicilio: { ...formData.domicilio, ...updates } })}
      prefix="dom_"
      errors={errors}
    />
  );
}
