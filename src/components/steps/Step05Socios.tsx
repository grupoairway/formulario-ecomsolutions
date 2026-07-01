'use client';

import { FormData, Socio, TipoAportacion, createEmptySocio, ESTADOS_CIVILES, SEXOS } from '@/lib/types';
import { DireccionForm } from './DireccionForm';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

const APORTACION_INFO: Record<TipoAportacion, string> = {
  dineraria_acreditada:
    'Aportación en dinero acreditada mediante certificado bancario. Requiere ingreso previo a la constitución.',
  no_dineraria:
    'Aportación en bienes o derechos (inmuebles, vehículos, equipos...). Requiere tasación por perito.',
  dineraria_no_acreditada:
    'Aportación en dinero sin acreditar. El socio asume responsabilidad solidaria de su veracidad.',
};

function parseNum(s: string): number {
  const n = parseFloat((s || '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function euros(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
}

function SocioBlock({
  socio,
  index,
  total,
  errors,
  onUpdate,
  onRemove,
}: {
  socio: Socio;
  index: number;
  total: number;
  errors: string[];
  onUpdate: (updates: Partial<Socio>) => void;
  onRemove: () => void;
}) {
  const esPersonaFisica = socio.tipo !== 'sociedad';
  const prefix = `socio${index}_`;

  return (
    <div className={styles.personaBlock}>
      <div className={styles.personaBlockHeader}>
        <span className={styles.personaBlockTitle}>Socio {index + 1}</span>
        {total > 1 && (
          <button type="button" className={styles.btnRemove} onClick={onRemove}>
            ✕ Eliminar
          </button>
        )}
      </div>

      {/* Tipo */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Tratamiento <span className={styles.required}>*</span></label>
        <div className={styles.radioInline}>
          {(['sr', 'sra', 'sociedad'] as const).map((t) => (
            <label
              key={t}
              className={`${styles.radioBtn} ${socio.tipo === t ? styles.selected : ''}`}
              onClick={() => onUpdate({ tipo: t })}
            >
              {t === 'sr' ? 'Sr.' : t === 'sra' ? 'Sra.' : 'Sociedad'}
            </label>
          ))}
        </div>
      </div>

      {/* Nombre */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {esPersonaFisica ? 'Nombre' : 'Denominación social'}{' '}
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes(`${prefix}nombre`) ? styles.error : ''}`}
          placeholder={esPersonaFisica ? 'Nombre' : 'Razón social'}
          value={socio.nombre}
          onChange={(e) => onUpdate({ nombre: e.target.value })}
        />
        {errors.includes(`${prefix}nombre`) && (
          <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
        )}
      </div>

      {/* Apellidos — solo persona física */}
      {esPersonaFisica && (
        <div className={styles.fieldRow}>
          <div>
            <label className={styles.label}>Primer apellido <span className={styles.required}>*</span></label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes(`${prefix}primerApellido`) ? styles.error : ''}`}
              placeholder="Primer apellido"
              value={socio.primerApellido}
              onChange={(e) => onUpdate({ primerApellido: e.target.value })}
            />
            {errors.includes(`${prefix}primerApellido`) && (
              <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
            )}
          </div>
          <div>
            <label className={styles.label}>Segundo apellido</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Segundo apellido"
              value={socio.segundoApellido}
              onChange={(e) => onUpdate({ segundoApellido: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Sexo — solo persona física */}
      {esPersonaFisica && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Sexo <span className={styles.required}>*</span></label>
          <div className={styles.radioInline}>
            {SEXOS.map((s) => (
              <label
                key={s.value}
                className={`${styles.radioBtn} ${socio.sexo === s.value ? styles.selected : ''}`}
                onClick={() => onUpdate({ sexo: s.value })}
              >
                {s.label}
              </label>
            ))}
          </div>
          {errors.includes(`${prefix}sexo`) && (
            <div className={styles.errorMsg}>⚠ Selecciona el sexo.</div>
          )}
        </div>
      )}

      {/* Documento e email */}
      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            {esPersonaFisica ? 'DNI / NIF / NIE' : 'CIF'}{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.includes(`${prefix}documento`) ? styles.error : ''}`}
            placeholder={esPersonaFisica ? 'Ej: 12345678A' : 'Ej: B12345678'}
            value={socio.documento}
            onChange={(e) => onUpdate({ documento: e.target.value.toUpperCase() })}
          />
          {errors.includes(`${prefix}documento`) && (
            <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
          )}
        </div>
        <div>
          <label className={styles.label}>
            Email {index === 0 && <span className={styles.required}>*</span>}
          </label>
          <input
            type="email"
            className={`${styles.input} ${errors.includes(`${prefix}email`) ? styles.error : ''}`}
            placeholder="correo@ejemplo.com"
            value={socio.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
          />
          {errors.includes(`${prefix}email`) && (
            <div className={styles.errorMsg}>⚠ Email obligatorio para el primer socio.</div>
          )}
        </div>
      </div>

      {/* Fecha y nacionalidad */}
      <div className={styles.fieldRow}>
        <div>
          <label className={styles.label}>
            Fecha de {esPersonaFisica ? 'nacimiento' : 'constitución'}{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            className={`${styles.input} ${errors.includes(`${prefix}fecha`) ? styles.error : ''}`}
            value={socio.fechaNacimientoConstitucion}
            onChange={(e) => onUpdate({ fechaNacimientoConstitucion: e.target.value })}
          />
          {errors.includes(`${prefix}fecha`) && (
            <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
          )}
        </div>
        <div>
          <label className={styles.label}>
            Nacionalidad <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.includes(`${prefix}nacionalidad`) ? styles.error : ''}`}
            placeholder="Española"
            value={socio.nacionalidad}
            onChange={(e) => onUpdate({ nacionalidad: e.target.value })}
          />
          {errors.includes(`${prefix}nacionalidad`) && (
            <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
          )}
        </div>
      </div>

      {/* Fecha inscripción registral — solo persona jurídica */}
      {!esPersonaFisica && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Fecha de inscripción registral <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            className={`${styles.input} ${errors.includes(`${prefix}fechaInscripcion`) ? styles.error : ''}`}
            value={socio.fechaInscripcion}
            onChange={(e) => onUpdate({ fechaInscripcion: e.target.value })}
          />
          {errors.includes(`${prefix}fechaInscripcion`) && (
            <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
          )}
        </div>
      )}

      {/* Estado civil — solo persona física */}
      {esPersonaFisica && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Estado civil <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${errors.includes(`${prefix}estadoCivil`) ? styles.error : ''}`}
            value={socio.estadoCivil}
            onChange={(e) => onUpdate({ estadoCivil: e.target.value })}
          >
            <option value="">Selecciona estado civil</option>
            {ESTADOS_CIVILES.map((ec) => (
              <option key={ec} value={ec}>{ec}</option>
            ))}
          </select>
          {errors.includes(`${prefix}estadoCivil`) && (
            <div className={styles.errorMsg}>⚠ Selecciona el estado civil.</div>
          )}
        </div>
      )}

      {/* Representante — solo persona jurídica */}
      {!esPersonaFisica && (
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 12 }}>
            Representante de la persona jurídica
          </p>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Nombre del representante <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes(`${prefix}representanteNombre`) ? styles.error : ''}`}
              placeholder="Nombre"
              value={socio.representanteNombre}
              onChange={(e) => onUpdate({ representanteNombre: e.target.value })}
            />
            {errors.includes(`${prefix}representanteNombre`) && (
              <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
            )}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Apellidos del representante</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Apellidos"
              value={socio.representanteApellidos}
              onChange={(e) => onUpdate({ representanteApellidos: e.target.value })}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              DNI / NIE del representante <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes(`${prefix}representanteDocumento`) ? styles.error : ''}`}
              placeholder="12345678A"
              value={socio.representanteDocumento}
              onChange={(e) => onUpdate({ representanteDocumento: e.target.value.toUpperCase() })}
            />
            {errors.includes(`${prefix}representanteDocumento`) && (
              <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
            )}
          </div>
        </div>
      )}

      {/* Domicilio */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Domicilio <span className={styles.required}>*</span></label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${socio.mismoDomicilio ? styles.selected : ''}`}
            onClick={() => onUpdate({ mismoDomicilio: true })}
          >
            Mismo que domicilio social
          </label>
          <label
            className={`${styles.radioBtn} ${!socio.mismoDomicilio ? styles.selected : ''}`}
            onClick={() => onUpdate({ mismoDomicilio: false })}
          >
            Otro domicilio
          </label>
        </div>
        {!socio.mismoDomicilio && (
          <div style={{ marginTop: 12 }}>
            <DireccionForm
              data={socio.direccion}
              onChange={(u) => onUpdate({ direccion: { ...socio.direccion, ...u } })}
              prefix={`${prefix}dir_`}
              errors={errors}
            />
          </div>
        )}
      </div>

      {/* Tipo aportación */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Tipo de aportación <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioCards}>
          {(
            [
              ['dineraria_acreditada', 'Dineraria con acreditación'],
              ['no_dineraria', 'No dineraria'],
              ['dineraria_no_acreditada', 'Dineraria no acreditada'],
            ] as [TipoAportacion, string][]
          ).map(([val, label]) => (
            <label
              key={val}
              className={`${styles.radioCard} ${socio.tipoAportacion === val ? styles.selected : ''}`}
              onClick={() => onUpdate({ tipoAportacion: val })}
            >
              <div className={styles.radioCircle}>
                {socio.tipoAportacion === val && <div className={styles.radioDot} />}
              </div>
              <div className={styles.radioCardBody}>
                <div className={styles.radioCardTitle}>{label}</div>
                <div className={styles.radioCardDesc}>{APORTACION_INFO[val]}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.includes(`${prefix}tipoAportacion`) && (
          <div className={styles.errorMsg}>⚠ Selecciona el tipo de aportación.</div>
        )}
      </div>

      {/* Importe de aportación (siempre que haya tipo) */}
      {socio.tipoAportacion && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            {socio.tipoAportacion === 'no_dineraria'
              ? 'Valoración de los bienes aportados (€)'
              : 'Importe de la aportación (€)'}
            {' '}<span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={`${styles.input} ${errors.includes(`${prefix}importe`) ? styles.error : ''}`}
            placeholder="3000.00"
            value={socio.importeAportacion}
            onChange={(e) => onUpdate({ importeAportacion: e.target.value })}
          />
          {errors.includes(`${prefix}importe`) && (
            <div className={styles.errorMsg}>⚠ Introduce el importe/valoración de la aportación.</div>
          )}
        </div>
      )}

      {/* Descripción de bienes — solo no dineraria */}
      {socio.tipoAportacion === 'no_dineraria' && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Descripción de los bienes aportados <span className={styles.required}>*</span>
          </label>
          <textarea
            className={`${styles.textarea} ${errors.includes(`${prefix}descripcionBienes`) ? styles.error : ''}`}
            placeholder="Describe los bienes que aportas (tipo, características, valor estimado...)"
            rows={3}
            value={socio.descripcionBienes}
            onChange={(e) => onUpdate({ descripcionBienes: e.target.value })}
          />
          {errors.includes(`${prefix}descripcionBienes`) && (
            <div className={styles.errorMsg}>⚠ Describe los bienes aportados.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Step05Socios({ formData, onChange, errors }: Props) {
  const { socios, capitalSocial } = formData;

  function updateSocio(index: number, updates: Partial<Socio>) {
    const next = socios.map((s, i) => (i === index ? { ...s, ...updates } : s));
    onChange({ socios: next });
  }

  function addSocio() {
    if (socios.length >= 5) return;
    onChange({ socios: [...socios, createEmptySocio()] });
  }

  function removeSocio(index: number) {
    onChange({ socios: socios.filter((_, i) => i !== index) });
  }

  const capital = parseNum(capitalSocial);
  const totalAportado = socios.reduce((sum, s) => sum + parseNum(s.importeAportacion), 0);
  const cuadra = capital > 0 && Math.abs(totalAportado - capital) < 0.005;
  const diferencia = capital - totalAportado;

  return (
    <div>
      {/* Capital social */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Capital social (€) <span className={styles.required}>*</span>
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          className={`${styles.input} ${errors.includes('capitalSocial') ? styles.error : ''}`}
          placeholder="3000.00"
          value={capitalSocial}
          onChange={(e) => onChange({ capitalSocial: e.target.value })}
        />
        {errors.includes('capitalSocial') && (
          <div className={styles.errorMsg}>⚠ Introduce el capital social.</div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          El capital social debe coincidir con la suma de las aportaciones de todos los socios.
        </div>
      </div>

      {socios.map((socio, i) => (
        <SocioBlock
          key={socio.id}
          socio={socio}
          index={i}
          total={socios.length}
          errors={errors}
          onUpdate={(updates) => updateSocio(i, updates)}
          onRemove={() => removeSocio(i)}
        />
      ))}

      {socios.length < 5 && (
        <button type="button" className={styles.btnAdd} onClick={addSocio}>
          + Añadir socio
        </button>
      )}

      {/* Resumen de cuadre */}
      <div className={styles.capitalTotal}>
        <span className={styles.capitalLabel}>Total aportado por los socios</span>
        <span className={styles.capitalAmount}>{euros(totalAportado)}</span>
      </div>

      {capital > 0 && (
        cuadra ? (
          <div className={styles.infoNote} style={{ marginTop: 12 }}>
            <span className={styles.infoNoteIcon}>✅</span>
            El total aportado coincide con el capital social.
          </div>
        ) : (
          <div className={styles.errorMsg} style={{ marginTop: 12 }}>
            ⚠ El total aportado ({euros(totalAportado)}) no coincide con el capital social ({euros(capital)}).
            {' '}Diferencia: {euros(Math.abs(diferencia))} {diferencia > 0 ? '(falta por aportar)' : '(exceso aportado)'}.
          </div>
        )
      )}
    </div>
  );
}
