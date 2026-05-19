'use client';

import { AutonomoFormData, DomicilioAutonomo, ESTADOS_CIVILES_AUTONOMO, ESTADOS_CON_FECHA } from '@/lib/types-autonomo';
import { PROVINCIAS } from '@/lib/types';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: AutonomoFormData;
  onChange: (updates: Partial<AutonomoFormData>) => void;
  errors: string[];
}

const TIPOS_DOCUMENTO = [
  { value: 'dni', label: 'DNI (ciudadano español)' },
  { value: 'nie_comunitario', label: 'NIE comunitario (ciudadano UE/EEE)' },
  { value: 'nie_extracomunitario', label: 'NIE extracomunitario (fuera de la UE)' },
];

function dom(formData: AutonomoFormData, k: keyof DomicilioAutonomo, v: string): Partial<AutonomoFormData> {
  return { domicilio: { ...formData.domicilio, [k]: v } };
}

export default function AutoStep01DatosPersonales({ formData, onChange, errors }: Props) {
  const { domicilio, centroActividad, mismoCentroActividad } = formData;
  const necesitaFechaEstado = ESTADOS_CON_FECHA.includes(formData.estadoCivil);

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

      {/* Fecha nacimiento + Nacionalidad */}
      <div className={styles.fieldRow}>
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
        <div>
          <label className={styles.label}>
            Nacionalidad <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.includes('nacionalidad') ? styles.error : ''}`}
            placeholder="Ej: Española"
            value={formData.nacionalidad}
            onChange={(e) => onChange({ nacionalidad: e.target.value })}
          />
          {errors.includes('nacionalidad') && (
            <div className={styles.errorMsg}>⚠ Indica tu nacionalidad.</div>
          )}
        </div>
      </div>

      {/* Tipo de documento */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Tipo de documento <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioCards}>
          {TIPOS_DOCUMENTO.map((op) => (
            <label
              key={op.value}
              className={`${styles.radioCard} ${formData.tipoDocumento === op.value ? styles.selected : ''}`}
              onClick={() => onChange({ tipoDocumento: op.value as AutonomoFormData['tipoDocumento'] })}
            >
              <div className={styles.radioCircle}>
                {formData.tipoDocumento === op.value && <div className={styles.radioDot} />}
              </div>
              <div className={styles.radioCardBody}>
                <div className={styles.radioCardTitle}>{op.label}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.includes('tipoDocumento') && (
          <div className={styles.errorMsg}>⚠ Selecciona el tipo de documento.</div>
        )}
      </div>

      {/* Número documento */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Número de DNI/NIE <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes('numeroDocumento') ? styles.error : ''}`}
          placeholder="Ej: 12345678A"
          value={formData.numeroDocumento}
          onChange={(e) => onChange({ numeroDocumento: e.target.value.toUpperCase() })}
        />
        {errors.includes('numeroDocumento') && (
          <div className={styles.errorMsg}>⚠ Introduce tu número de DNI/NIE.</div>
        )}
        {formData.tipoDocumento === 'nie_extracomunitario' && (
          <div className={styles.infoNote} style={{ marginTop: 10 }}>
            <span className={styles.infoNoteIcon}>⚠️</span>
            <span>
              <strong>Importante:</strong> Al ser NIE extracomunitario necesitarás adjuntar el
              permiso de trabajo o tarjeta de residencia en vigor (paso 4).
            </span>
          </div>
        )}
      </div>

      {/* Domicilio */}
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: 16 }}>
          Domicilio particular
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

      {/* ¿Mismo centro de actividad? */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿El centro de actividad será en este mismo domicilio? <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${mismoCentroActividad === true ? styles.selected : ''}`}
            onClick={() => onChange({ mismoCentroActividad: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${mismoCentroActividad === false ? styles.selected : ''}`}
            onClick={() => onChange({ mismoCentroActividad: false })}
          >
            No, tengo otra dirección
          </label>
        </div>
        {errors.includes('mismoCentroActividad') && (
          <div className={styles.errorMsg}>⚠ Indica si el centro de actividad coincide con el domicilio.</div>
        )}
      </div>

      {/* Centro de actividad diferente */}
      {mismoCentroActividad === false && (
        <div className={styles.personaBlock}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 16, color: 'var(--color-text)' }}>
            Dirección del centro de actividad
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Dirección completa <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes('centro_direccion') ? styles.error : ''}`}
              placeholder="Calle, número, piso..."
              value={centroActividad.direccion}
              onChange={(e) => onChange({ centroActividad: { ...centroActividad, direccion: e.target.value } })}
            />
            {errors.includes('centro_direccion') && (
              <div className={styles.errorMsg}>⚠ Introduce la dirección del centro de actividad.</div>
            )}
          </div>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>
                Código postal <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.includes('centro_cp') ? styles.error : ''}`}
                placeholder="00000"
                maxLength={5}
                value={centroActividad.cp}
                onChange={(e) => onChange({ centroActividad: { ...centroActividad, cp: e.target.value.replace(/\D/g, '') } })}
              />
              {errors.includes('centro_cp') && (
                <div className={styles.errorMsg}>⚠ Código postal de 5 dígitos.</div>
              )}
            </div>
            <div>
              <label className={styles.label}>
                m² dedicados a la actividad <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                min="1"
                className={`${styles.input} ${errors.includes('centro_m2') ? styles.error : ''}`}
                placeholder="0"
                value={centroActividad.m2}
                onChange={(e) => onChange({ centroActividad: { ...centroActividad, m2: e.target.value } })}
              />
              {errors.includes('centro_m2') && (
                <div className={styles.errorMsg}>⚠ Indica los metros cuadrados dedicados.</div>
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
                className={`${styles.input} ${errors.includes('centro_municipio') ? styles.error : ''}`}
                placeholder="Ciudad o municipio"
                value={centroActividad.municipio}
                onChange={(e) => onChange({ centroActividad: { ...centroActividad, municipio: e.target.value } })}
              />
              {errors.includes('centro_municipio') && (
                <div className={styles.errorMsg}>⚠ Introduce el municipio.</div>
              )}
            </div>
            <div>
              <label className={styles.label}>
                Provincia <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.includes('centro_provincia') ? styles.error : ''}`}
                value={centroActividad.provincia}
                onChange={(e) => onChange({ centroActividad: { ...centroActividad, provincia: e.target.value } })}
              >
                <option value="">Selecciona provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.includes('centro_provincia') && (
                <div className={styles.errorMsg}>⚠ Selecciona la provincia.</div>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Estado civil */}
      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Estado civil <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${errors.includes('estadoCivil') ? styles.error : ''}`}
            value={formData.estadoCivil}
            onChange={(e) => onChange({ estadoCivil: e.target.value, fechaEstadoCivil: '' })}
          >
            <option value="">Selecciona estado civil</option>
            {ESTADOS_CIVILES_AUTONOMO.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          {errors.includes('estadoCivil') && (
            <div className={styles.errorMsg}>⚠ Selecciona tu estado civil.</div>
          )}
        </div>
        {necesitaFechaEstado && (
          <div>
            <label className={styles.label}>
              Fecha ({formData.estadoCivil.toLowerCase()})
            </label>
            <input
              type="date"
              className={styles.input}
              value={formData.fechaEstadoCivil}
              onChange={(e) => onChange({ fechaEstadoCivil: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
