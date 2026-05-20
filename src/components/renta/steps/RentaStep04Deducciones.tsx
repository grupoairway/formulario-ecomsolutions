'use client';

import { RentaFormData, DEDUCCIONES_AUTONOMICAS_OPTIONS } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function SiNo({ value, onSi, onNo }: { value: boolean | null; onSi: () => void; onNo: () => void }) {
  return (
    <div className={styles.radioInline}>
      <label className={`${styles.radioBtn} ${value === true ? styles.selected : ''}`} onClick={onSi}>Sí</label>
      <label className={`${styles.radioBtn} ${value === false ? styles.selected : ''}`} onClick={onNo}>No</label>
    </div>
  );
}

function SubSection({ title }: { title: string }) {
  return (
    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 24, paddingBottom: 6, borderBottom: '2px solid var(--color-border)' }}>
      {title}
    </div>
  );
}

export default function RentaStep04Deducciones({ formData, onChange }: Props) {
  const provincia = formData.domicilio.provincia || 'tu comunidad autónoma';

  function toggleDeduccionAut(key: string) {
    const current = formData.deduccionesAutonomicas;
    onChange({
      deduccionesAutonomicas: current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    });
  }

  return (
    <div>
      <div className={styles.infoNote} style={{ marginBottom: 24 }}>
        <span className={styles.infoNoteIcon}>ℹ️</span>
        <span>
          Responde solo a las que te apliquen. Aplicaremos automáticamente las deducciones
          autonómicas de <strong>{provincia}</strong>.
        </span>
      </div>

      {/* ══ VIVIENDA ══ */}
      <SubSection title="Vivienda" />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Adquirió su vivienda habitual antes del 1 de enero de 2013?</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Deducción transitoria por inversión en vivienda habitual.</div>
        <SiNo value={formData.viviendaHabitual2013}
          onSi={() => onChange({ viviendaHabitual2013: true })}
          onNo={() => onChange({ viviendaHabitual2013: false })} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Recibió en el ejercicio devolución de cláusula suelo de su hipoteca?</label>
        <SiNo value={formData.clausulaSupelo}
          onSi={() => onChange({ clausulaSupelo: true })}
          onNo={() => onChange({ clausulaSupelo: false })} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Paga alquiler de vivienda habitual con contrato anterior al 1 de enero de 2015?</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Deducción estatal transitoria por alquiler de vivienda habitual.</div>
        <SiNo value={formData.alquilerAntes2015}
          onSi={() => onChange({ alquilerAntes2015: true })}
          onNo={() => onChange({ alquilerAntes2015: false })} />
      </div>

      {/* ══ PLANES DE PREVISIÓN ══ */}
      <SubSection title="Planes de pensiones y previsión" />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha realizado aportaciones a un plan de pensiones a su nombre?</label>
        <SiNo value={formData.tienePlanPensiones}
          onSi={() => onChange({ tienePlanPensiones: true })}
          onNo={() => onChange({ tienePlanPensiones: false, importePlanPensiones: '' })} />
      </div>
      {formData.tienePlanPensiones === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe aportado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 2000"
            value={formData.importePlanPensiones} onChange={(e) => onChange({ importePlanPensiones: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha aportado a un plan de pensiones a nombre de su cónyuge?</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Máximo 1.000 €/año deducibles si el cónyuge no tiene rendimientos o son inferiores a 8.000 €.</div>
        <SiNo value={formData.tieneAportacionConyuge}
          onSi={() => onChange({ tieneAportacionConyuge: true })}
          onNo={() => onChange({ tieneAportacionConyuge: false, importeAportacionConyuge: '' })} />
      </div>
      {formData.tieneAportacionConyuge === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe aportado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 1000"
            value={formData.importeAportacionConyuge} onChange={(e) => onChange({ importeAportacionConyuge: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene un Plan de Previsión Asegurado (PPA)?</label>
        <SiNo value={formData.tienePPA}
          onSi={() => onChange({ tienePPA: true })}
          onNo={() => onChange({ tienePPA: false, importePPA: '' })} />
      </div>
      {formData.tienePPA === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe aportado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 1500"
            value={formData.importePPA} onChange={(e) => onChange({ importePPA: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene contratado un seguro de dependencia?</label>
        <SiNo value={formData.tieneSeguroDependencia}
          onSi={() => onChange({ tieneSeguroDependencia: true })}
          onNo={() => onChange({ tieneSeguroDependencia: false, importeSeguroDependencia: '' })} />
      </div>
      {formData.tieneSeguroDependencia === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Prima pagada en el ejercicio (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 800"
            value={formData.importeSeguroDependencia} onChange={(e) => onChange({ importeSeguroDependencia: e.target.value })} />
        </div>
      )}

      {/* ══ FAMILIA Y COMPENSACIONES ══ */}
      <SubSection title="Familia y compensaciones" />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Paga una pensión compensatoria a su excónyuge por resolución judicial?</label>
        <SiNo value={formData.tienePensionCompensatoria}
          onSi={() => onChange({ tienePensionCompensatoria: true })}
          onNo={() => onChange({ tienePensionCompensatoria: false, importePensionCompensatoria: '' })} />
      </div>
      {formData.tienePensionCompensatoria === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe anual pagado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 6000"
            value={formData.importePensionCompensatoria} onChange={(e) => onChange({ importePensionCompensatoria: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Paga anualidades por alimentos a sus hijos por resolución judicial?</label>
        <SiNo value={formData.tieneAnualidadesAlimentos}
          onSi={() => onChange({ tieneAnualidadesAlimentos: true })}
          onNo={() => onChange({ tieneAnualidadesAlimentos: false, importeAnualidadesAlimentos: '' })} />
      </div>
      {formData.tieneAnualidadesAlimentos === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe anual pagado (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 3600"
            value={formData.importeAnualidadesAlimentos} onChange={(e) => onChange({ importeAnualidadesAlimentos: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Tiene hijos menores de 3 años?</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Deducción por maternidad (hasta 1.200 €/año por hijo).</div>
        <SiNo value={formData.tieneHijosMenos3}
          onSi={() => onChange({ tieneHijosMenos3: true })}
          onNo={() => onChange({ tieneHijosMenos3: false, cobroAbono140: null })} />
      </div>
      {formData.tieneHijosMenos3 === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>¿Solicitó el abono anticipado de la deducción por maternidad (Modelo 140)?</label>
          <SiNo value={formData.cobroAbono140}
            onSi={() => onChange({ cobroAbono140: true })}
            onNo={() => onChange({ cobroAbono140: false })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha pagado guardería autorizada para un hijo menor de 3 años?</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Incremento de la deducción por maternidad de hasta 1.000 €/año adicionales.</div>
        <SiNo value={formData.tieneGuarderia}
          onSi={() => onChange({ tieneGuarderia: true })}
          onNo={() => onChange({ tieneGuarderia: false, guarderia: { nombreCentro: '', nifCentro: '', importe: '' } })} />
      </div>
      {formData.tieneGuarderia === true && (
        <div className={styles.personaBlock}>
          <div className={styles.fieldRow}>
            <div>
              <label className={styles.label}>Nombre del centro</label>
              <input type="text" className={styles.input} placeholder="Nombre de la guardería"
                value={formData.guarderia.nombreCentro}
                onChange={(e) => onChange({ guarderia: { ...formData.guarderia, nombreCentro: e.target.value } })} />
            </div>
            <div>
              <label className={styles.label}>NIF del centro</label>
              <input type="text" className={styles.input} placeholder="Ej: A12345678"
                value={formData.guarderia.nifCentro}
                onChange={(e) => onChange({ guarderia: { ...formData.guarderia, nifCentro: e.target.value.toUpperCase() } })} />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Importe pagado en el ejercicio (€)</label>
            <input type="number" min="0" className={styles.input} placeholder="Ej: 3200"
              value={formData.guarderia.importe}
              onChange={(e) => onChange({ guarderia: { ...formData.guarderia, importe: e.target.value } })} />
          </div>
        </div>
      )}

      {/* ══ OTROS ══ */}
      <SubSection title="Otros incentivos fiscales" />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha realizado donativos a ONGs, fundaciones u otras entidades sin ánimo de lucro?</label>
        <SiNo value={formData.tieneDonativos}
          onSi={() => onChange({ tieneDonativos: true })}
          onNo={() => onChange({ tieneDonativos: false, importeDonativos: '' })} />
      </div>
      {formData.tieneDonativos === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe total de donativos (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 300"
            value={formData.importeDonativos} onChange={(e) => onChange({ importeDonativos: e.target.value })} />
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>Conserva los certificados de cada entidad.</div>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha invertido en empresas de nueva o reciente creación (Business Angels)?</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Deducción estatal del 50% de la inversión, máximo 100.000 €/año.</div>
        <SiNo value={formData.tieneInversionNuevaEmpresa}
          onSi={() => onChange({ tieneInversionNuevaEmpresa: true })}
          onNo={() => onChange({ tieneInversionNuevaEmpresa: false, importeInversionNuevaEmpresa: '' })} />
      </div>
      {formData.tieneInversionNuevaEmpresa === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe invertido (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 10000"
            value={formData.importeInversionNuevaEmpresa} onChange={(e) => onChange({ importeInversionNuevaEmpresa: e.target.value })} />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Ha obtenido rentas del trabajo en el extranjero sujetas a exención?</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Art. 7.p LIRPF: trabajos realizados en el extranjero para empresas no residentes.</div>
        <SiNo value={formData.tieneRentasExtranjero}
          onSi={() => onChange({ tieneRentasExtranjero: true })}
          onNo={() => onChange({ tieneRentasExtranjero: false, importeRentasExtranjero: '' })} />
      </div>
      {formData.tieneRentasExtranjero === true && (
        <div className={styles.personaBlock}>
          <label className={styles.label}>Importe de rentas en el extranjero (€)</label>
          <input type="number" min="0" className={styles.input} placeholder="Ej: 8000"
            value={formData.importeRentasExtranjero} onChange={(e) => onChange({ importeRentasExtranjero: e.target.value })} />
        </div>
      )}

      {/* ══ DEDUCCIONES AUTONÓMICAS ══ */}
      <SubSection title={`Deducciones autonómicas — ${provincia}`} />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Marca las deducciones autonómicas que puedan aplicarte (orientativo)</label>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 12 }}>
          Las verificaremos con tu situación real al preparar la declaración.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {DEDUCCIONES_AUTONOMICAS_OPTIONS.map((opt) => {
            const checked = formData.deduccionesAutonomicas.includes(opt.key);
            return (
              <div
                key={opt.key}
                onClick={() => toggleDeduccionAut(opt.key)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  border: `2px solid ${checked ? 'var(--color-blue)' : 'var(--color-border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: checked ? 'var(--color-blue-light)' : 'transparent',
                  fontSize: '0.8rem',
                  userSelect: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${checked ? 'var(--color-blue)' : 'var(--color-border)'}`,
                  background: checked ? 'var(--color-blue)' : 'var(--color-white)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.7rem', fontWeight: 700,
                  transition: 'background 0.15s, border-color 0.15s',
                }}>
                  {checked && '✓'}
                </div>
                <span style={{ color: 'var(--color-text)', lineHeight: 1.4 }}>{opt.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.infoNote} style={{ marginTop: 8 }}>
        <span className={styles.infoNoteIcon}>📍</span>
        <span>
          Provincia de residencia: <strong>{provincia}</strong>. Aplicaremos también todas las
          deducciones autonómicas aplicables a tu situación al preparar la declaración.
        </span>
      </div>
    </div>
  );
}
