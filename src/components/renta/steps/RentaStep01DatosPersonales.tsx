'use client';

import { RentaFormData, DomicilioRenta, ESTADOS_CIVILES_RENTA } from '@/lib/types-renta';
import { PROVINCIAS } from '@/lib/types';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function dom(formData: RentaFormData, k: keyof DomicilioRenta, v: string): Partial<RentaFormData> {
  return { domicilio: { ...formData.domicilio, [k]: v } };
}

export default function RentaStep01DatosPersonales({ formData, onChange, errors }: Props) {
  const { domicilio, declaracionTipo, conyuge } = formData;

  return (
    <div>
      {/* Nombre completo */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Nombre completo <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes('nombreCompleto') ? styles.error : ''}`}
          placeholder="Nombre y apellidos"
          value={formData.nombreCompleto}
          onChange={(e) => onChange({ nombreCompleto: e.target.value })}
        />
        {errors.includes('nombreCompleto') && (
          <div className={styles.errorMsg}>⚠ Introduce tu nombre completo.</div>
        )}
      </div>

      {/* NIF/DNI + Fecha de nacimiento */}
      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            NIF / DNI <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.includes('nif') ? styles.error : ''}`}
            placeholder="Ej: 12345678A"
            value={formData.nif}
            onChange={(e) => onChange({ nif: e.target.value.toUpperCase() })}
          />
          {errors.includes('nif') && (
            <div className={styles.errorMsg}>⚠ Introduce tu NIF o DNI.</div>
          )}
        </div>
        <div>
          <label className={styles.label}>
            Fecha de nacimiento <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            className={`${styles.input} ${errors.includes('fechaNacimiento') ? styles.error : ''}`}
            value={formData.fechaNacimiento}
            onChange={(e) => onChange({ fechaNacimiento: e.target.value })}
          />
          {errors.includes('fechaNacimiento') && (
            <div className={styles.errorMsg}>⚠ Indica tu fecha de nacimiento.</div>
          )}
        </div>
      </div>

      {/* Estado civil */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Estado civil <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.select} ${errors.includes('estadoCivil') ? styles.error : ''}`}
          value={formData.estadoCivil}
          onChange={(e) => onChange({ estadoCivil: e.target.value })}
        >
          <option value="">Selecciona estado civil</option>
          {ESTADOS_CIVILES_RENTA.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        {errors.includes('estadoCivil') && (
          <div className={styles.errorMsg}>⚠ Selecciona tu estado civil.</div>
        )}
      </div>

      {/* Tipo de declaración */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Tipo de declaración <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${declaracionTipo === 'individual' ? styles.selected : ''}`}
            onClick={() => onChange({ declaracionTipo: 'individual' })}
          >
            Individual
          </label>
          <label
            className={`${styles.radioBtn} ${declaracionTipo === 'conjunta' ? styles.selected : ''}`}
            onClick={() => onChange({ declaracionTipo: 'conjunta' })}
          >
            Conjunta (matrimonio / pareja de hecho)
          </label>
        </div>
        {errors.includes('declaracionTipo') && (
          <div className={styles.errorMsg}>⚠ Indica si la declaración es individual o conjunta.</div>
        )}
      </div>

      {/* Datos del cónyuge si declaración conjunta */}
      {declaracionTipo === 'conjunta' && (
        <div className={styles.personaBlock}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 16, color: 'var(--color-text)' }}>
            Datos del cónyuge / pareja de hecho
          </div>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>
                Nombre completo <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.includes('conyuge_nombre') ? styles.error : ''}`}
                placeholder="Nombre y apellidos"
                value={conyuge.nombre}
                onChange={(e) => onChange({ conyuge: { ...conyuge, nombre: e.target.value } })}
              />
              {errors.includes('conyuge_nombre') && (
                <div className={styles.errorMsg}>⚠ Introduce el nombre del cónyuge.</div>
              )}
            </div>
            <div>
              <label className={styles.label}>
                NIF / DNI <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.includes('conyuge_nif') ? styles.error : ''}`}
                placeholder="Ej: 12345678A"
                value={conyuge.nif}
                onChange={(e) => onChange({ conyuge: { ...conyuge, nif: e.target.value.toUpperCase() } })}
              />
              {errors.includes('conyuge_nif') && (
                <div className={styles.errorMsg}>⚠ Introduce el NIF del cónyuge.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Domicilio */}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: 16 }}>
          Domicilio habitual
        </div>
        <div className={styles.fieldRow}>
          <div>
            <label className={styles.label}>
              Calle / Avenida <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes('dom_calle') ? styles.error : ''}`}
              placeholder="Nombre de la vía"
              value={domicilio.calle}
              onChange={(e) => onChange(dom(formData, 'calle', e.target.value))}
            />
            {errors.includes('dom_calle') && (
              <div className={styles.errorMsg}>⚠ Introduce la calle.</div>
            )}
          </div>
          <div>
            <label className={styles.label}>
              Número <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes('dom_numero') ? styles.error : ''}`}
              placeholder="Nº"
              value={domicilio.numero}
              onChange={(e) => onChange(dom(formData, 'numero', e.target.value))}
            />
            {errors.includes('dom_numero') && (
              <div className={styles.errorMsg}>⚠ Introduce el número.</div>
            )}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div>
            <label className={styles.label}>Piso / Puerta (opcional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej: 3º B"
              value={domicilio.piso}
              onChange={(e) => onChange(dom(formData, 'piso', e.target.value))}
            />
          </div>
          <div>
            <label className={styles.label}>
              Código postal <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes('dom_cp') ? styles.error : ''}`}
              placeholder="00000"
              maxLength={5}
              value={domicilio.cp}
              onChange={(e) => onChange(dom(formData, 'cp', e.target.value.replace(/\D/g, '')))}
            />
            {errors.includes('dom_cp') && (
              <div className={styles.errorMsg}>⚠ Código postal de 5 dígitos.</div>
            )}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div>
            <label className={styles.label}>
              Municipio <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes('dom_municipio') ? styles.error : ''}`}
              placeholder="Ciudad o municipio"
              value={domicilio.municipio}
              onChange={(e) => onChange(dom(formData, 'municipio', e.target.value))}
            />
            {errors.includes('dom_municipio') && (
              <div className={styles.errorMsg}>⚠ Introduce el municipio.</div>
            )}
          </div>
          <div>
            <label className={styles.label}>
              Provincia <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${errors.includes('dom_provincia') ? styles.error : ''}`}
              value={domicilio.provincia}
              onChange={(e) => onChange(dom(formData, 'provincia', e.target.value))}
            >
              <option value="">Selecciona provincia</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.includes('dom_provincia') && (
              <div className={styles.errorMsg}>⚠ Selecciona la provincia.</div>
            )}
          </div>
        </div>
      </div>

      {/* Teléfono + Email */}
      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Teléfono móvil <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            className={`${styles.input} ${errors.includes('telefono') ? styles.error : ''}`}
            placeholder="6XX XXX XXX"
            value={formData.telefono}
            onChange={(e) => onChange({ telefono: e.target.value })}
          />
          {errors.includes('telefono') && (
            <div className={styles.errorMsg}>⚠ Introduce tu teléfono móvil.</div>
          )}
        </div>
        <div>
          <label className={styles.label}>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            className={`${styles.input} ${errors.includes('email') ? styles.error : ''}`}
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
          {errors.includes('email') && (
            <div className={styles.errorMsg}>⚠ Introduce un email válido.</div>
          )}
        </div>
      </div>

      {/* Cambio de domicilio */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Ha cambiado de domicilio durante el ejercicio fiscal? <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.cambioDomicilio === true ? styles.selected : ''}`}
            onClick={() => onChange({ cambioDomicilio: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.cambioDomicilio === false ? styles.selected : ''}`}
            onClick={() => onChange({ cambioDomicilio: false })}
          >
            No
          </label>
        </div>
        {errors.includes('cambioDomicilio') && (
          <div className={styles.errorMsg}>⚠ Indica si has cambiado de domicilio.</div>
        )}
      </div>
    </div>
  );
}
