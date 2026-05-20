'use client';

import { RentaFormData } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

export default function RentaStep03Ingresos({ formData, onChange }: Props) {
  return (
    <div>
      <div className={styles.infoNote} style={{ marginBottom: 24 }}>
        <span className={styles.infoNoteIcon}>ℹ️</span>
        <span>
          Indica los ingresos aproximados del ejercicio. Con estos datos prepararemos tu declaración.
          No te preocupes si no recuerdas el importe exacto, puedes ajustarlo después.
        </span>
      </div>

      {/* ── Rendimientos del trabajo: nóminas ── */}
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 4 }}>
        Rendimientos del trabajo
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha percibido salarios o nóminas durante el ejercicio?</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneNominas === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneNominas: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneNominas === false ? styles.selected : ''}`}
            onClick={() => onChange({
              tieneNominas: false,
              numeroPagadores: '',
              importeBrutoTotal: '',
              retencionesTotal: '',
            })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneNominas === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>Número de pagadores (empresas)</label>
              <select
                className={styles.select}
                value={formData.numeroPagadores}
                onChange={(e) => onChange({ numeroPagadores: e.target.value })}
              >
                <option value="">Selecciona</option>
                <option value="1">1 pagador</option>
                <option value="2">2 pagadores</option>
                <option value="3">3 pagadores</option>
                <option value="4+">4 o más pagadores</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Importe bruto total estimado (€)</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="Ej: 28000"
                value={formData.importeBrutoTotal}
                onChange={(e) => onChange({ importeBrutoTotal: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Retenciones totales (€)</label>
            <input
              type="number"
              min="0"
              className={styles.input}
              placeholder="Ej: 4200"
              value={formData.retencionesTotal}
              onChange={(e) => onChange({ retencionesTotal: e.target.value })}
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>
              Puedes encontrar este dato en el certificado de retenciones de tu empresa.
            </div>
          </div>
        </div>
      )}

      {/* ── Desempleo ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha cobrado prestación por desempleo (paro)?</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneDesempleo === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneDesempleo: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneDesempleo === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneDesempleo: false, importeDesempleo: '' })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneDesempleo === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe cobrado aproximado (€)</label>
          <input
            type="number"
            min="0"
            className={styles.input}
            placeholder="Ej: 6000"
            value={formData.importeDesempleo}
            onChange={(e) => onChange({ importeDesempleo: e.target.value })}
          />
        </div>
      )}

      {/* ── Pensiones ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha cobrado alguna pensión (jubilación, incapacidad, viudedad)?</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tienePension === true ? styles.selected : ''}`}
            onClick={() => onChange({ tienePension: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tienePension === false ? styles.selected : ''}`}
            onClick={() => onChange({ tienePension: false, tipoPension: '', importePension: '' })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tienePension === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>Tipo de pensión</label>
              <select
                className={styles.select}
                value={formData.tipoPension}
                onChange={(e) => onChange({ tipoPension: e.target.value })}
              >
                <option value="">Selecciona</option>
                <option value="Jubilación">Jubilación</option>
                <option value="Incapacidad permanente">Incapacidad permanente</option>
                <option value="Viudedad">Viudedad</option>
                <option value="Orfandad">Orfandad</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Importe anual estimado (€)</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="Ej: 14000"
                value={formData.importePension}
                onChange={(e) => onChange({ importePension: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Actividades económicas (autónomo) ── */}
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 20 }}>
        Actividades económicas
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene ingresos como trabajador/a autónomo/a?</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneAutonomo === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneAutonomo: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneAutonomo === false ? styles.selected : ''}`}
            onClick={() => onChange({
              tieneAutonomo: false,
              regimenEstimacion: '',
              ingresosAutonomo: '',
              gastosAutonomo: '',
            })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneAutonomo === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Régimen de estimación</label>
            <div className={styles.radioCards}>
              {[
                { value: 'directa_normal', label: 'Estimación directa normal', desc: 'Ingresos anuales superiores a 600.000 €' },
                { value: 'directa_simplificada', label: 'Estimación directa simplificada', desc: 'Ingresos anuales inferiores a 600.000 € (la más habitual)' },
                { value: 'modulos', label: 'Estimación objetiva (módulos)', desc: 'Para actividades agrarias, ganaderas y algunas empresariales' },
              ].map((op) => (
                <label
                  key={op.value}
                  className={`${styles.radioCard} ${formData.regimenEstimacion === op.value ? styles.selected : ''}`}
                  onClick={() => onChange({ regimenEstimacion: op.value })}
                >
                  <div className={styles.radioCircle}>
                    {formData.regimenEstimacion === op.value && <div className={styles.radioDot} />}
                  </div>
                  <div className={styles.radioCardBody}>
                    <div className={styles.radioCardTitle}>{op.label}</div>
                    <div className={styles.radioCardDesc}>{op.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>Ingresos aproximados (€/año)</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="Ej: 35000"
                value={formData.ingresosAutonomo}
                onChange={(e) => onChange({ ingresosAutonomo: e.target.value })}
              />
            </div>
            <div>
              <label className={styles.label}>Gastos deducibles aproximados (€/año)</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="Ej: 12000"
                value={formData.gastosAutonomo}
                onChange={(e) => onChange({ gastosAutonomo: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Capital inmobiliario: alquiler ── */}
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 20 }}>
        Rendimientos del capital inmobiliario
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene inmuebles alquilados (pisos, locales, garajes)?</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneAlquiler === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneAlquiler: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneAlquiler === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneAlquiler: false, ingresosAlquiler: '', gastosAlquiler: '' })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneAlquiler === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>Ingresos por alquiler (€/año)</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="Ej: 9600"
                value={formData.ingresosAlquiler}
                onChange={(e) => onChange({ ingresosAlquiler: e.target.value })}
              />
            </div>
            <div>
              <label className={styles.label}>Gastos deducibles (€/año)</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="Ej: 2400"
                value={formData.gastosAlquiler}
                onChange={(e) => onChange({ gastosAlquiler: e.target.value })}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>
                IBI, comunidad, seguros, intereses hipoteca, amortización...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Ganancias/pérdidas patrimoniales ── */}
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 20 }}>
        Ganancias y pérdidas patrimoniales
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Ha vendido acciones, fondos de inversión, inmuebles, criptomonedas u otros activos?
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneGanancias === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneGanancias: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneGanancias === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneGanancias: false, descripcionGanancias: '' })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneGanancias === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Describe brevemente qué has vendido y el resultado aproximado</label>
          <textarea
            className={styles.textarea}
            placeholder="Ej: Venta de 100 acciones de Telefónica por 1.200 €, pérdida en fondos de -800 €..."
            value={formData.descripcionGanancias}
            onChange={(e) => onChange({ descripcionGanancias: e.target.value })}
          />
        </div>
      )}

      {/* ── Capital mobiliario ── */}
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 20 }}>
        Rendimientos del capital mobiliario
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Ha recibido dividendos, intereses bancarios u otros rendimientos financieros?
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${formData.tieneCapitalMobiliario === true ? styles.selected : ''}`}
            onClick={() => onChange({ tieneCapitalMobiliario: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${formData.tieneCapitalMobiliario === false ? styles.selected : ''}`}
            onClick={() => onChange({ tieneCapitalMobiliario: false, importeCapitalMobiliario: '' })}
          >
            No
          </label>
        </div>
      </div>

      {formData.tieneCapitalMobiliario === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe total aproximado (€)</label>
          <input
            type="number"
            min="0"
            className={styles.input}
            placeholder="Ej: 450"
            value={formData.importeCapitalMobiliario}
            onChange={(e) => onChange({ importeCapitalMobiliario: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
