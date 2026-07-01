'use client';

import { DireccionDetallada, DomicilioFields, PROVINCIAS, TIPOS_VIA } from '@/lib/types';
import styles from './steps.module.css';

interface DireccionFormProps {
  data: DireccionDetallada;
  onChange: (updates: Partial<DireccionDetallada>) => void;
  prefix: string;
  errors: string[];
}

// Dirección desglosada reutilizable (domicilio social, centro de actividad, socios)
export function DireccionForm({ data, onChange, prefix, errors }: DireccionFormProps) {
  const err = (k: string) => errors.includes(`${prefix}${k}`);

  return (
    <div>
      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Tipo de vía <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${err('tipoVia') ? styles.error : ''}`}
            value={data.tipoVia}
            onChange={(e) => onChange({ tipoVia: e.target.value })}
          >
            {TIPOS_VIA.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {err('tipoVia') && <div className={styles.errorMsg}>⚠ Selecciona el tipo de vía.</div>}
        </div>
        <div>
          <label className={styles.label}>
            Nombre de la vía <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${err('nombreVia') ? styles.error : ''}`}
            placeholder="Ej: Gran Vía"
            value={data.nombreVia}
            onChange={(e) => onChange({ nombreVia: e.target.value })}
          />
          {err('nombreVia') && <div className={styles.errorMsg}>⚠ Introduce el nombre de la vía.</div>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Número <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${err('numero') ? styles.error : ''}`}
            placeholder="Ej: 25"
            value={data.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
          />
          {err('numero') && <div className={styles.errorMsg}>⚠ Introduce el número.</div>}
        </div>
        <div>
          <label className={styles.label}>Bloque</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Opcional"
            value={data.bloque}
            onChange={(e) => onChange({ bloque: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>Piso</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Opcional"
            value={data.piso}
            onChange={(e) => onChange({ piso: e.target.value })}
          />
        </div>
        <div>
          <label className={styles.label}>Puerta</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Opcional"
            value={data.puerta}
            onChange={(e) => onChange({ puerta: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Provincia <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.select} ${err('provincia') ? styles.error : ''}`}
          value={data.provincia}
          onChange={(e) => onChange({ provincia: e.target.value })}
        >
          <option value="">Selecciona provincia</option>
          {PROVINCIAS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {err('provincia') && <div className={styles.errorMsg}>⚠ Selecciona la provincia.</div>}
      </div>

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Municipio <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${err('municipio') ? styles.error : ''}`}
            placeholder="Ciudad o municipio"
            value={data.municipio}
            onChange={(e) => onChange({ municipio: e.target.value })}
          />
          {err('municipio') && <div className={styles.errorMsg}>⚠ Introduce el municipio.</div>}
        </div>
        <div>
          <label className={styles.label}>
            Código postal <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${err('codigoPostal') ? styles.error : ''}`}
            placeholder="00000"
            maxLength={5}
            value={data.codigoPostal}
            onChange={(e) => onChange({ codigoPostal: e.target.value.replace(/\D/g, '') })}
          />
          {err('codigoPostal') && (
            <div className={styles.errorMsg}>⚠ Introduce el código postal (5 dígitos).</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LocalDomicilioFormProps {
  data: DomicilioFields;
  onChange: (updates: Partial<DomicilioFields>) => void;
  prefix: string;
  errors: string[];
}

// Dirección desglosada + superficie y % de actividad (domicilio social / centro de actividad)
export function LocalDomicilioForm({ data, onChange, prefix, errors }: LocalDomicilioFormProps) {
  const err = (k: string) => errors.includes(`${prefix}${k}`);

  return (
    <div>
      <DireccionForm
        data={data.direccion}
        onChange={(updates) => onChange({ direccion: { ...data.direccion, ...updates } })}
        prefix={prefix}
        errors={errors}
      />

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Superficie total (m²) <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            min="1"
            className={`${styles.input} ${err('superficie') ? styles.error : ''}`}
            placeholder="0"
            value={data.superficie}
            onChange={(e) => onChange({ superficie: e.target.value })}
          />
          {err('superficie') && <div className={styles.errorMsg}>⚠ Introduce la superficie.</div>}
        </div>
        <div>
          <label className={styles.label}>
            % usado para la actividad <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            min="1"
            max="100"
            className={`${styles.input} ${err('porcentajeActividad') ? styles.error : ''}`}
            placeholder="100"
            value={data.porcentajeActividad}
            onChange={(e) => onChange({ porcentajeActividad: e.target.value })}
          />
          {err('porcentajeActividad') && (
            <div className={styles.errorMsg}>⚠ Introduce el porcentaje (1–100).</div>
          )}
        </div>
      </div>
    </div>
  );
}
