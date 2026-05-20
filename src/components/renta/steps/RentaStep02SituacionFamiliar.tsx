'use client';

import { RentaFormData, HijoRenta, AscendienteRenta, PARENTESCO_OPTIONS } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function newHijo(): HijoRenta {
  return { id: crypto.randomUUID(), nombre: '', nif: '', fechaNacimiento: '', discapacidad: false, porcentajeDiscapacidad: '', convive: null };
}

function newAscendiente(): AscendienteRenta {
  return { id: crypto.randomUUID(), nombre: '', nif: '', parentesco: '', discapacidad: false, gradoDiscapacidad: '', conviveTodoElAnio: null };
}

export default function RentaStep02SituacionFamiliar({ formData, onChange }: Props) {
  const { hijos, ascendientes } = formData;

  function updateHijo(id: string, field: keyof HijoRenta, value: string | boolean | null) {
    onChange({ hijos: hijos.map((h) => (h.id === id ? { ...h, [field]: value } : h)) });
  }
  function removeHijo(id: string) { onChange({ hijos: hijos.filter((h) => h.id !== id) }); }
  function addHijo() { onChange({ hijos: [...hijos, newHijo()] }); }

  function updateAsc(id: string, field: keyof AscendienteRenta, value: string | boolean | null) {
    onChange({ ascendientes: ascendientes.map((a) => (a.id === id ? { ...a, [field]: value } : a)) });
  }
  function removeAsc(id: string) { onChange({ ascendientes: ascendientes.filter((a) => a.id !== id) }); }
  function addAsc() { onChange({ ascendientes: [...ascendientes, newAscendiente()] }); }

  return (
    <div>
      {/* ── Hijos ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene hijos menores o dependientes a cargo?</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneHijos === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneHijos: true, hijos: hijos.length === 0 ? [newHijo()] : hijos })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneHijos === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneHijos: false, hijos: [] })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneHijos === true && (
        <div style={{ marginBottom: 20 }}>
          {hijos.map((hijo, idx) => (
            <div key={hijo.id} className={styles.personaBlock} style={{ marginBottom: 12 }}>
              <div className={styles.personaBlockHeader}>
                <span className={styles.personaBlockTitle}>Hijo/a {idx + 1}</span>
                <button type="button" className={styles.btnRemove} onClick={() => removeHijo(hijo.id)}>Eliminar</button>
              </div>
              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.label}>Nombre completo</label>
                  <input type="text" className={styles.input} placeholder="Nombre y apellidos"
                    value={hijo.nombre} onChange={(e) => updateHijo(hijo.id, 'nombre', e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>NIF / DNI</label>
                  <input type="text" className={styles.input} placeholder="Ej: 12345678A"
                    value={hijo.nif} onChange={(e) => updateHijo(hijo.id, 'nif', e.target.value.toUpperCase())} />
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.label}>Fecha de nacimiento</label>
                  <input type="date" className={styles.input}
                    value={hijo.fechaNacimiento} onChange={(e) => updateHijo(hijo.id, 'fechaNacimiento', e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>¿Convive con usted?</label>
                  <div className={styles.radioInline} style={{ marginTop: 8 }}>
                    <label className={`${styles.radioBtn} ${hijo.convive === true ? styles.selected : ''}`}
                      onClick={() => updateHijo(hijo.id, 'convive', true)}>Sí</label>
                    <label className={`${styles.radioBtn} ${hijo.convive === false ? styles.selected : ''}`}
                      onClick={() => updateHijo(hijo.id, 'convive', false)}>No</label>
                  </div>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>¿Tiene reconocida alguna discapacidad?</label>
                <div className={styles.radioInline}>
                  <label className={`${styles.radioBtn} ${hijo.discapacidad === true ? styles.selected : ''}`}
                    onClick={() => updateHijo(hijo.id, 'discapacidad', true)}>Sí</label>
                  <label className={`${styles.radioBtn} ${hijo.discapacidad === false ? styles.selected : ''}`}
                    onClick={() => updateHijo(hijo.id, 'discapacidad', false)}>No</label>
                </div>
              </div>
              {hijo.discapacidad && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Porcentaje de discapacidad (%)</label>
                  <input type="text" className={styles.input} placeholder="Ej: 33"
                    value={hijo.porcentajeDiscapacidad} onChange={(e) => updateHijo(hijo.id, 'porcentajeDiscapacidad', e.target.value)} />
                </div>
              )}
            </div>
          ))}
          <button type="button" className={styles.btnAdd} onClick={addHijo}>+ Añadir otro hijo/a</button>
        </div>
      )}

      {/* ── Ascendientes ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene ascendientes a cargo (padres, abuelos)?</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneAscendientes === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneAscendientes: true, ascendientes: ascendientes.length === 0 ? [newAscendiente()] : ascendientes })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneAscendientes === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneAscendientes: false, ascendientes: [] })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneAscendientes === true && (
        <div style={{ marginBottom: 20 }}>
          {ascendientes.map((asc, idx) => (
            <div key={asc.id} className={styles.personaBlock} style={{ marginBottom: 12 }}>
              <div className={styles.personaBlockHeader}>
                <span className={styles.personaBlockTitle}>Ascendiente {idx + 1}</span>
                <button type="button" className={styles.btnRemove} onClick={() => removeAsc(asc.id)}>Eliminar</button>
              </div>
              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.label}>Nombre completo</label>
                  <input type="text" className={styles.input} placeholder="Nombre y apellidos"
                    value={asc.nombre} onChange={(e) => updateAsc(asc.id, 'nombre', e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>NIF / DNI</label>
                  <input type="text" className={styles.input} placeholder="Ej: 12345678A"
                    value={asc.nif} onChange={(e) => updateAsc(asc.id, 'nif', e.target.value.toUpperCase())} />
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.label}>Parentesco</label>
                  <select className={styles.select} value={asc.parentesco}
                    onChange={(e) => updateAsc(asc.id, 'parentesco', e.target.value)}>
                    <option value="">Selecciona</option>
                    {PARENTESCO_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={styles.label}>¿Convive todo el año o solo parte?</label>
                  <div className={styles.radioInline} style={{ marginTop: 8 }}>
                    <label className={`${styles.radioBtn} ${asc.conviveTodoElAnio === true ? styles.selected : ''}`}
                      onClick={() => updateAsc(asc.id, 'conviveTodoElAnio', true)}>Todo el año</label>
                    <label className={`${styles.radioBtn} ${asc.conviveTodoElAnio === false ? styles.selected : ''}`}
                      onClick={() => updateAsc(asc.id, 'conviveTodoElAnio', false)}>Parte del año</label>
                  </div>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>¿Tiene reconocida alguna discapacidad?</label>
                <div className={styles.radioInline}>
                  <label className={`${styles.radioBtn} ${asc.discapacidad === true ? styles.selected : ''}`}
                    onClick={() => updateAsc(asc.id, 'discapacidad', true)}>Sí</label>
                  <label className={`${styles.radioBtn} ${asc.discapacidad === false ? styles.selected : ''}`}
                    onClick={() => updateAsc(asc.id, 'discapacidad', false)}>No</label>
                </div>
              </div>
              {asc.discapacidad && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Grado de discapacidad (%)</label>
                  <input type="text" className={styles.input} placeholder="Ej: 65"
                    value={asc.gradoDiscapacidad} onChange={(e) => updateAsc(asc.id, 'gradoDiscapacidad', e.target.value)} />
                </div>
              )}
            </div>
          ))}
          <button type="button" className={styles.btnAdd} onClick={addAsc}>+ Añadir otro ascendiente</button>
        </div>
      )}

      {/* ── Discapacidad propia ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene reconocida alguna discapacidad?</label>
        <div className={styles.radioInline}>
          <label className={`${styles.radioBtn} ${formData.tieneDiscapacidad === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneDiscapacidad: true })}>Sí</label>
          <label className={`${styles.radioBtn} ${formData.tieneDiscapacidad === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneDiscapacidad: false, porcentajeDiscapacidad: '' })}>No</label>
        </div>
      </div>
      {formData.tieneDiscapacidad === true && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Porcentaje de discapacidad (%)</label>
          <input type="text" className={styles.input} placeholder="Ej: 33"
            value={formData.porcentajeDiscapacidad}
            onChange={(e) => onChange({ porcentajeDiscapacidad: e.target.value })} />
        </div>
      )}

      {/* ── Pensionista viudedad ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Es pensionista de viudedad?</label>
        <div className={styles.radioInline}>
          <label className={`${styles.radioBtn} ${formData.esPensionistaViudedad === true ? styles.selected : ''}`}
            onClick={() => onChange({ esPensionistaViudedad: true })}>Sí</label>
          <label className={`${styles.radioBtn} ${formData.esPensionistaViudedad === false ? styles.selected : ''}`}
            onClick={() => onChange({ esPensionistaViudedad: false })}>No</label>
        </div>
      </div>

      {/* ── Familia numerosa ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene reconocido el título de familia numerosa?</label>
        <div className={styles.radioInline}>
          <label className={`${styles.radioBtn} ${formData.familiaNumerosa === true ? styles.selected : ''}`}
            onClick={() => onChange({ familiaNumerosa: true })}>Sí</label>
          <label className={`${styles.radioBtn} ${formData.familiaNumerosa === false ? styles.selected : ''}`}
            onClick={() => onChange({ familiaNumerosa: false, categoriaNumerosa: '' })}>No</label>
        </div>
      </div>
      {formData.familiaNumerosa === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Categoría</label>
          <div className={styles.radioInline}>
            <label className={`${styles.radioBtn} ${formData.categoriaNumerosa === 'general' ? styles.selected : ''}`}
              onClick={() => onChange({ categoriaNumerosa: 'general' })}>General (3 hijos o más)</label>
            <label className={`${styles.radioBtn} ${formData.categoriaNumerosa === 'especial' ? styles.selected : ''}`}
              onClick={() => onChange({ categoriaNumerosa: 'especial' })}>Especial (5 hijos o más)</label>
          </div>
        </div>
      )}

      {/* ── Familia monoparental ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Es familia monoparental?</label>
        <div className={styles.radioInline}>
          <label className={`${styles.radioBtn} ${formData.familiaMonoparental === true ? styles.selected : ''}`}
            onClick={() => onChange({ familiaMonoparental: true })}>Sí</label>
          <label className={`${styles.radioBtn} ${formData.familiaMonoparental === false ? styles.selected : ''}`}
            onClick={() => onChange({ familiaMonoparental: false })}>No</label>
        </div>
      </div>

      <div className={styles.infoNote}>
        <span className={styles.infoNoteIcon}>ℹ️</span>
        <span>Estos datos son necesarios para calcular el mínimo personal y familiar que reducirá tu cuota.</span>
      </div>
    </div>
  );
}
