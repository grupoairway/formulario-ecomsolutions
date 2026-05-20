'use client';

import { RentaFormData, InmuebleRenta } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function newInmueble(): InmuebleRenta {
  return { id: crypto.randomUUID(), referenciaCatastral: '', porcentajeTitularidad: '100', uso: '', ingresosAlquiler: '', gastosAlquiler: '' };
}

function SiNo({ value, onSi, onNo }: { value: boolean | null; onSi: () => void; onNo: () => void }) {
  return (
    <div className={styles.radioInline}>
      <label className={`${styles.radioBtn} ${value === true ? styles.selected : ''}`} onClick={onSi}>Sí</label>
      <label className={`${styles.radioBtn} ${value === false ? styles.selected : ''}`} onClick={onNo}>No</label>
    </div>
  );
}

export default function RentaStep03Ingresos({ formData, onChange }: Props) {
  const { inmuebles } = formData;

  function updateInmueble(id: string, field: keyof InmuebleRenta, value: string) {
    onChange({ inmuebles: inmuebles.map((i) => (i.id === id ? { ...i, [field]: value } : i)) });
  }
  function removeInmueble(id: string) { onChange({ inmuebles: inmuebles.filter((i) => i.id !== id) }); }
  function addInmueble() { onChange({ inmuebles: [...inmuebles, newInmueble()] }); }

  return (
    <div>
      <div className={styles.infoNote} style={{ marginBottom: 24 }}>
        <span className={styles.infoNoteIcon}>ℹ️</span>
        <span>Indica los ingresos aproximados del ejercicio. Los importes exactos los ajustaremos con tu documentación.</span>
      </div>

      {/* ══ RENDIMIENTOS DEL TRABAJO ══ */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid var(--color-border)' }}>
        Rendimientos del trabajo
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha percibido salarios o nóminas durante el ejercicio?</label>
        <SiNo value={formData.tieneNominas}
          onSi={() => onChange({ tieneNominas: true })}
          onNo={() => onChange({ tieneNominas: false, numeroPagadores: '', importeBrutoTotal: '', retencionesTotal: '' })} />
      </div>
      {formData.tieneNominas === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>Número de pagadores (empresas)</label>
              <select className={styles.select} value={formData.numeroPagadores}
                onChange={(e) => onChange({ numeroPagadores: e.target.value })}>
                <option value="">Selecciona</option>
                <option value="1">1 pagador</option>
                <option value="2">2 pagadores</option>
                <option value="3">3 pagadores</option>
                <option value="4+">4 o más pagadores</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Importe bruto total estimado (€)</label>
              <input type="number" min="0" className={styles.input} placeholder="Ej: 28000"
                value={formData.importeBrutoTotal} onChange={(e) => onChange({ importeBrutoTotal: e.target.value })} />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Retenciones totales (€)</label>
            <input type="number" min="0" className={styles.input} placeholder="Ej: 4200"
              value={formData.retencionesTotal} onChange={(e) => onChange({ retencionesTotal: e.target.value })} />
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>Suma de retenciones de todos los pagadores.</div>
          </div>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha recibido retribuciones en especie? (vehículo de empresa, vivienda, seguro médico, guardería...)</label>
        <SiNo value={formData.tieneRetribucionesEspecie}
          onSi={() => onChange({ tieneRetribucionesEspecie: true })}
          onNo={() => onChange({ tieneRetribucionesEspecie: false, descripcionRetribucionesEspecie: '' })} />
      </div>
      {formData.tieneRetribucionesEspecie === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Describe brevemente el tipo de retribución</label>
          <textarea className={styles.textarea} placeholder="Ej: Vehículo empresa (valor 18.000 €), seguro médico colectivo..."
            value={formData.descripcionRetribucionesEspecie}
            onChange={(e) => onChange({ descripcionRetribucionesEspecie: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha percibido dietas o gastos de viaje no exentos?</label>
        <SiNo value={formData.tieneDietas}
          onSi={() => onChange({ tieneDietas: true })}
          onNo={() => onChange({ tieneDietas: false, importeDietas: '' })} />
      </div>
      {formData.tieneDietas === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe total (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 1800"
            value={formData.importeDietas} onChange={(e) => onChange({ importeDietas: e.target.value })} />
        </div>
      )}

      {/* ══ PRESTACIONES ══ */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '2px solid var(--color-border)' }}>
        Prestaciones y pensiones
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha cobrado prestación por desempleo (paro)?</label>
        <SiNo value={formData.tieneDesempleo}
          onSi={() => onChange({ tieneDesempleo: true })}
          onNo={() => onChange({ tieneDesempleo: false, importeDesempleo: '' })} />
      </div>
      {formData.tieneDesempleo === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe cobrado aproximado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 6000"
            value={formData.importeDesempleo} onChange={(e) => onChange({ importeDesempleo: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha cobrado incapacidad temporal (baja médica)?</label>
        <SiNo value={formData.tieneIncapacidadTemporal}
          onSi={() => onChange({ tieneIncapacidadTemporal: true })}
          onNo={() => onChange({ tieneIncapacidadTemporal: false, importeIncapacidadTemporal: '' })} />
      </div>
      {formData.tieneIncapacidadTemporal === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe cobrado aproximado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 3500"
            value={formData.importeIncapacidadTemporal} onChange={(e) => onChange({ importeIncapacidadTemporal: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha cobrado prestación por maternidad o paternidad?</label>
        <SiNo value={formData.tieneMaternidadPaternidad}
          onSi={() => onChange({ tieneMaternidadPaternidad: true })}
          onNo={() => onChange({ tieneMaternidadPaternidad: false, importeMaternidadPaternidad: '' })} />
      </div>
      {formData.tieneMaternidadPaternidad === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe cobrado aproximado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 4200"
            value={formData.importeMaternidadPaternidad} onChange={(e) => onChange({ importeMaternidadPaternidad: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha cobrado alguna pensión (jubilación, incapacidad permanente, viudedad)?</label>
        <SiNo value={formData.tienePension}
          onSi={() => onChange({ tienePension: true })}
          onNo={() => onChange({ tienePension: false, tipoPension: '', importePension: '' })} />
      </div>
      {formData.tienePension === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>Tipo de pensión</label>
              <select className={styles.select} value={formData.tipoPension}
                onChange={(e) => onChange({ tipoPension: e.target.value })}>
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
              <input type="number" min="0" className={styles.input} placeholder="Ej: 14000"
                value={formData.importePension} onChange={(e) => onChange({ importePension: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* ══ ACTIVIDADES ECONÓMICAS ══ */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '2px solid var(--color-border)' }}>
        Actividades económicas (autónomo/a)
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene ingresos como trabajador/a autónomo/a?</label>
        <SiNo value={formData.tieneAutonomo}
          onSi={() => onChange({ tieneAutonomo: true })}
          onNo={() => onChange({ tieneAutonomo: false, regimenEstimacion: '', ingresosAutonomo: '', gastosAutonomo: '', cuotasSSAutonomo: '', tieneTrabajadoresAutonomo: null, usaVehiculoActividad: null, usaLocalActividad: null })} />
      </div>
      {formData.tieneAutonomo === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Régimen de estimación</label>
            <div className={styles.radioCards}>
              {[
                { value: 'directa_simplificada', label: 'Estimación directa simplificada', desc: 'Ingresos < 600.000 €/año (la más habitual)' },
                { value: 'directa_normal', label: 'Estimación directa normal', desc: 'Ingresos ≥ 600.000 €/año' },
                { value: 'modulos', label: 'Estimación objetiva (módulos)', desc: 'Actividades agrarias y algunas empresariales' },
              ].map((op) => (
                <label key={op.value}
                  className={`${styles.radioCard} ${formData.regimenEstimacion === op.value ? styles.selected : ''}`}
                  onClick={() => onChange({ regimenEstimacion: op.value })}>
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
              <input type="number" min="0" className={styles.input} placeholder="Ej: 35000"
                value={formData.ingresosAutonomo} onChange={(e) => onChange({ ingresosAutonomo: e.target.value })} />
            </div>
            <div>
              <label className={styles.label}>Gastos deducibles aproximados (€/año)</label>
              <input type="number" min="0" className={styles.input} placeholder="Ej: 12000"
                value={formData.gastosAutonomo} onChange={(e) => onChange({ gastosAutonomo: e.target.value })} />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Cuotas de la Seguridad Social pagadas (€/año)</label>
            <input type="number" min="0" className={styles.input} placeholder="Ej: 3600"
              value={formData.cuotasSSAutonomo} onChange={(e) => onChange({ cuotasSSAutonomo: e.target.value })} />
          </div>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>¿Tiene trabajadores/as a cargo?</label>
              <div className={styles.radioInline} style={{ marginTop: 8 }}>
                <label className={`${styles.radioBtn} ${formData.tieneTrabajadoresAutonomo === true ? styles.selected : ''}`}
                  onClick={() => onChange({ tieneTrabajadoresAutonomo: true })}>Sí</label>
                <label className={`${styles.radioBtn} ${formData.tieneTrabajadoresAutonomo === false ? styles.selected : ''}`}
                  onClick={() => onChange({ tieneTrabajadoresAutonomo: false })}>No</label>
              </div>
            </div>
            <div>
              <label className={styles.label}>¿Usa vehículo para la actividad?</label>
              <div className={styles.radioInline} style={{ marginTop: 8 }}>
                <label className={`${styles.radioBtn} ${formData.usaVehiculoActividad === true ? styles.selected : ''}`}
                  onClick={() => onChange({ usaVehiculoActividad: true })}>Sí</label>
                <label className={`${styles.radioBtn} ${formData.usaVehiculoActividad === false ? styles.selected : ''}`}
                  onClick={() => onChange({ usaVehiculoActividad: false })}>No</label>
              </div>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>¿Usa un local o parte del domicilio para la actividad?</label>
            <div className={styles.radioInline}>
              <label className={`${styles.radioBtn} ${formData.usaLocalActividad === true ? styles.selected : ''}`}
                onClick={() => onChange({ usaLocalActividad: true })}>Sí</label>
              <label className={`${styles.radioBtn} ${formData.usaLocalActividad === false ? styles.selected : ''}`}
                onClick={() => onChange({ usaLocalActividad: false })}>No</label>
            </div>
          </div>
        </div>
      )}

      {/* ══ INMUEBLES ══ */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '2px solid var(--color-border)' }}>
        Inmuebles (viviendas, locales, garajes, terrenos)
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Es titular de algún inmueble distinto a su vivienda habitual de alquiler o en propiedad?</label>
        <SiNo value={formData.tieneInmuebles}
          onSi={() => onChange({ tieneInmuebles: true, inmuebles: inmuebles.length === 0 ? [newInmueble()] : inmuebles })}
          onNo={() => onChange({ tieneInmuebles: false, inmuebles: [] })} />
      </div>
      {formData.tieneInmuebles === true && (
        <div style={{ marginBottom: 12 }}>
          {inmuebles.map((inm, idx) => (
            <div key={inm.id} className={styles.personaBlock} style={{ marginBottom: 12 }}>
              <div className={styles.personaBlockHeader}>
                <span className={styles.personaBlockTitle}>Inmueble {idx + 1}</span>
                <button type="button" className={styles.btnRemove} onClick={() => removeInmueble(inm.id)}>Eliminar</button>
              </div>
              <div className={styles.fieldRow}>
                <div>
                  <label className={styles.label}>Referencia catastral</label>
                  <input type="text" className={styles.input} placeholder="Ej: 1234567VK1234A0001WX"
                    value={inm.referenciaCatastral} onChange={(e) => updateInmueble(inm.id, 'referenciaCatastral', e.target.value.toUpperCase())} />
                </div>
                <div>
                  <label className={styles.label}>% de titularidad</label>
                  <input type="number" min="1" max="100" className={styles.input} placeholder="Ej: 50"
                    value={inm.porcentajeTitularidad} onChange={(e) => updateInmueble(inm.id, 'porcentajeTitularidad', e.target.value)} />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Uso del inmueble</label>
                <div className={styles.radioInline}>
                  {[
                    { value: 'habitual', label: 'Vivienda habitual' },
                    { value: 'alquilado', label: 'Alquilado' },
                    { value: 'vacio', label: 'Vacío / a disposición' },
                    { value: 'propio', label: 'Uso propio (no habitual)' },
                  ].map((op) => (
                    <label key={op.value}
                      className={`${styles.radioBtn} ${inm.uso === op.value ? styles.selected : ''}`}
                      onClick={() => updateInmueble(inm.id, 'uso', op.value)}>
                      {op.label}
                    </label>
                  ))}
                </div>
              </div>
              {inm.uso === 'alquilado' && (
                <div className={styles.fieldRow}>
                  <div>
                    <label className={styles.label}>Ingresos por alquiler (€/año)</label>
                    <input type="number" min="0" className={styles.input} placeholder="Ej: 9600"
                      value={inm.ingresosAlquiler} onChange={(e) => updateInmueble(inm.id, 'ingresosAlquiler', e.target.value)} />
                  </div>
                  <div>
                    <label className={styles.label}>Gastos deducibles (€/año)</label>
                    <input type="number" min="0" className={styles.input} placeholder="Ej: 2400"
                      value={inm.gastosAlquiler} onChange={(e) => updateInmueble(inm.id, 'gastosAlquiler', e.target.value)} />
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: 4 }}>IBI, comunidad, seguros, intereses, amortización...</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button type="button" className={styles.btnAdd} onClick={addInmueble}>+ Añadir otro inmueble</button>
        </div>
      )}

      {/* ══ INTERNACIONAL ══ */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '2px solid var(--color-border)' }}>
        Cuentas y bienes en el extranjero
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene cuentas bancarias, valores u otros bienes en el extranjero (Modelo 720)?</label>
        <SiNo value={formData.tieneCuentasExtranjero}
          onSi={() => onChange({ tieneCuentasExtranjero: true })}
          onNo={() => onChange({ tieneCuentasExtranjero: false })} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha recibido dividendos de empresas extranjeras o rendimientos de cuentas en el extranjero?</label>
        <SiNo value={formData.tieneDividendosExtranjero}
          onSi={() => onChange({ tieneDividendosExtranjero: true })}
          onNo={() => onChange({ tieneDividendosExtranjero: false, importeDividendosExtranjero: '' })} />
      </div>
      {formData.tieneDividendosExtranjero === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe total aproximado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 1200"
            value={formData.importeDividendosExtranjero} onChange={(e) => onChange({ importeDividendosExtranjero: e.target.value })} />
        </div>
      )}

      {/* ══ PATRIMONIO Y CAPITAL ══ */}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '2px solid var(--color-border)' }}>
        Ganancias, pérdidas y capital
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha operado con criptomonedas durante el ejercicio?</label>
        <SiNo value={formData.tieneCripto}
          onSi={() => onChange({ tieneCripto: true })}
          onNo={() => onChange({ tieneCripto: false, descripcionCripto: '' })} />
      </div>
      {formData.tieneCripto === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Describe brevemente tus operaciones</label>
          <textarea className={styles.textarea} placeholder="Ej: Venta de Bitcoin y Ethereum, resultado aproximado +2.400 €..."
            value={formData.descripcionCripto} onChange={(e) => onChange({ descripcionCripto: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha vendido acciones, fondos de inversión, inmuebles u otros activos?</label>
        <SiNo value={formData.tieneGanancias}
          onSi={() => onChange({ tieneGanancias: true })}
          onNo={() => onChange({ tieneGanancias: false, descripcionGanancias: '' })} />
      </div>
      {formData.tieneGanancias === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Describe brevemente qué has vendido y el resultado aproximado</label>
          <textarea className={styles.textarea} placeholder="Ej: 100 acciones Telefónica por 1.200 €, piso heredado vendido por 85.000 €..."
            value={formData.descripcionGanancias} onChange={(e) => onChange({ descripcionGanancias: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene pérdidas patrimoniales de ejercicios anteriores pendientes de compensar?</label>
        <SiNo value={formData.tienePerdidasAnteriores}
          onSi={() => onChange({ tienePerdidasAnteriores: true })}
          onNo={() => onChange({ tienePerdidasAnteriores: false, importePerdidasAnteriores: '' })} />
      </div>
      {formData.tienePerdidasAnteriores === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe pendiente de compensar (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 3200"
            value={formData.importePerdidasAnteriores} onChange={(e) => onChange({ importePerdidasAnteriores: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha recibido dividendos, intereses bancarios u otros rendimientos financieros en España?</label>
        <SiNo value={formData.tieneCapitalMobiliario}
          onSi={() => onChange({ tieneCapitalMobiliario: true })}
          onNo={() => onChange({ tieneCapitalMobiliario: false, importeCapitalMobiliario: '' })} />
      </div>
      {formData.tieneCapitalMobiliario === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe total aproximado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 450"
            value={formData.importeCapitalMobiliario} onChange={(e) => onChange({ importeCapitalMobiliario: e.target.value })} />
        </div>
      )}
    </div>
  );
}
