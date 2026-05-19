'use client';

import { FormData, Socio, TipoAportacion, createEmptySocio, PROVINCIAS, ESTADOS_CIVILES } from '@/lib/types';
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

function capitalDinerario(socios: Socio[]): number {
  let total = 0;
  for (const s of socios) {
    if (s.tipoAportacion === 'dineraria_acreditada' || s.tipoAportacion === 'dineraria_no_acreditada') {
      const v = parseFloat(s.aportacion.replace(',', '.'));
      if (!isNaN(v)) total += v;
    }
  }
  return total;
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
            <input
              type="text"
              className={styles.input}
              placeholder="Dirección completa (calle, número, municipio, CP...)"
              value={socio.direccionAlternativa}
              onChange={(e) => onUpdate({ direccionAlternativa: e.target.value })}
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

      {/* Aportación */}
      {socio.tipoAportacion && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            {socio.tipoAportacion === 'no_dineraria'
              ? 'Descripción de los bienes aportados'
              : 'Importe de la aportación (€)'}
            {' '}<span className={styles.required}>*</span>
          </label>
          {socio.tipoAportacion === 'no_dineraria' ? (
            <textarea
              className={`${styles.textarea} ${errors.includes(`${prefix}aportacion`) ? styles.error : ''}`}
              placeholder="Describe los bienes que aportas (tipo, valor estimado...)"
              rows={3}
              value={socio.aportacion}
              onChange={(e) => onUpdate({ aportacion: e.target.value })}
            />
          ) : (
            <input
              type="number"
              min="1"
              step="0.01"
              className={`${styles.input} ${errors.includes(`${prefix}aportacion`) ? styles.error : ''}`}
              placeholder="3000.00"
              value={socio.aportacion}
              onChange={(e) => onUpdate({ aportacion: e.target.value })}
            />
          )}
          {errors.includes(`${prefix}aportacion`) && (
            <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Step05Socios({ formData, onChange, errors }: Props) {
  const { socios } = formData;

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

  const capital = capitalDinerario(socios);

  return (
    <div>
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

      <div className={styles.capitalTotal}>
        <span className={styles.capitalLabel}>Capital social total (dinerario)</span>
        <span className={styles.capitalAmount}>
          {capital.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
        </span>
      </div>
    </div>
  );
}
