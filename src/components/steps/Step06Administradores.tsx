'use client';

import { Administrador, FormData, TipoAdministracion, createEmptyAdministrador, MUTUAS } from '@/lib/types';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

function AdminBlock({
  admin,
  index,
  total,
  errors,
  onUpdate,
  onRemove,
}: {
  admin: Administrador;
  index: number;
  total: number;
  errors: string[];
  onUpdate: (u: Partial<Administrador>) => void;
  onRemove: () => void;
}) {
  const prefix = `admin${index}_`;
  const esPersona = admin.tipo === 'persona';

  return (
    <div className={styles.personaBlock}>
      <div className={styles.personaBlockHeader}>
        <span className={styles.personaBlockTitle}>Administrador {index + 1}</span>
        {total > 1 && (
          <button type="button" className={styles.btnRemove} onClick={onRemove}>
            ✕ Eliminar
          </button>
        )}
      </div>

      {/* Tipo persona/sociedad */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Tipo</label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${esPersona ? styles.selected : ''}`}
            onClick={() => onUpdate({ tipo: 'persona' })}
          >
            Persona física
          </label>
          <label
            className={`${styles.radioBtn} ${!esPersona ? styles.selected : ''}`}
            onClick={() => onUpdate({ tipo: 'sociedad' })}
          >
            Persona jurídica
          </label>
        </div>
      </div>

      {/* Datos */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {esPersona ? 'Nombre' : 'Denominación social'}{' '}
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes(`${prefix}nombre`) ? styles.error : ''}`}
          placeholder={esPersona ? 'Nombre' : 'Razón social'}
          value={admin.nombre}
          onChange={(e) => onUpdate({ nombre: e.target.value })}
        />
        {errors.includes(`${prefix}nombre`) && (
          <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
        )}
      </div>

      {esPersona && (
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Apellidos</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Apellidos"
            value={admin.apellidos}
            onChange={(e) => onUpdate({ apellidos: e.target.value })}
          />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {esPersona ? 'DNI / NIF / NIE' : 'CIF'}{' '}
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes(`${prefix}documento`) ? styles.error : ''}`}
          placeholder={esPersona ? '12345678A' : 'B12345678'}
          value={admin.documento}
          onChange={(e) => onUpdate({ documento: e.target.value.toUpperCase() })}
        />
        {errors.includes(`${prefix}documento`) && (
          <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
        )}
      </div>

      {/* Representante (solo persona jurídica) */}
      {!esPersona && (
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 12 }}>
            Representante de la persona jurídica
          </p>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nombre del representante</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Nombre"
              value={admin.representanteNombre}
              onChange={(e) => onUpdate({ representanteNombre: e.target.value })}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Apellidos del representante</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Apellidos"
              value={admin.representanteApellidos}
              onChange={(e) => onUpdate({ representanteApellidos: e.target.value })}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>DNI / NIE del representante</label>
            <input
              type="text"
              className={styles.input}
              placeholder="12345678A"
              value={admin.representanteDocumento}
              onChange={(e) => onUpdate({ representanteDocumento: e.target.value.toUpperCase() })}
            />
          </div>
        </div>
      )}

      {/* Retribución */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Cobrarán por su trabajo como administrador?{' '}
          <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${admin.cobranRetribucion === true ? styles.selected : ''}`}
            onClick={() => onUpdate({ cobranRetribucion: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${admin.cobranRetribucion === false ? styles.selected : ''}`}
            onClick={() => onUpdate({ cobranRetribucion: false, tipoRetribucion: null, porcentajeRetribucion: '' })}
          >
            No
          </label>
        </div>
        {errors.includes(`${prefix}cobranRetribucion`) && (
          <div className={styles.errorMsg}>⚠ Indica si cobrarán retribución.</div>
        )}
      </div>

      {admin.cobranRetribucion === true && (
        <div style={{ paddingLeft: 16, borderLeft: '3px solid var(--color-blue-border)', marginBottom: 20 }}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tipo de retribución</label>
            <div className={styles.radioInline}>
              <label
                className={`${styles.radioBtn} ${admin.tipoRetribucion === 'fija' ? styles.selected : ''}`}
                onClick={() => onUpdate({ tipoRetribucion: 'fija', porcentajeRetribucion: '' })}
              >
                Fija
              </label>
              <label
                className={`${styles.radioBtn} ${admin.tipoRetribucion === 'porcentual' ? styles.selected : ''}`}
                onClick={() => onUpdate({ tipoRetribucion: 'porcentual' })}
              >
                Porcentual
              </label>
            </div>
          </div>
          {admin.tipoRetribucion === 'porcentual' && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Porcentaje (%) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={styles.input}
                placeholder="Ej: 5"
                value={admin.porcentajeRetribucion}
                onChange={(e) => onUpdate({ porcentajeRetribucion: e.target.value })}
              />
            </div>
          )}
        </div>
      )}

      {/* Autónomo societario */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Está dado de alta como autónomo societario?{' '}
          <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioInline}>
          <label
            className={`${styles.radioBtn} ${admin.esAutonomoSocietario === true ? styles.selected : ''}`}
            onClick={() => onUpdate({ esAutonomoSocietario: true })}
          >
            Sí
          </label>
          <label
            className={`${styles.radioBtn} ${admin.esAutonomoSocietario === false ? styles.selected : ''}`}
            onClick={() =>
              onUpdate({
                esAutonomoSocietario: false,
                numeroAfiliacionSS: '',
                mutua: '',
                iban: '',
                tarifaReducida: null,
              })
            }
          >
            No
          </label>
        </div>
        {errors.includes(`${prefix}esAutonomoSocietario`) && (
          <div className={styles.errorMsg}>⚠ Indica si está dado de alta como autónomo societario.</div>
        )}
      </div>

      {admin.esAutonomoSocietario === true && (
        <div style={{ paddingLeft: 16, borderLeft: '3px solid var(--color-blue-border)' }}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Número de afiliación SS <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes(`${prefix}numeroAfiliacionSS`) ? styles.error : ''}`}
              placeholder="Ej: 280012345678"
              value={admin.numeroAfiliacionSS}
              onChange={(e) => onUpdate({ numeroAfiliacionSS: e.target.value })}
            />
            {errors.includes(`${prefix}numeroAfiliacionSS`) && (
              <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Mutua IT <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${errors.includes(`${prefix}mutua`) ? styles.error : ''}`}
              value={admin.mutua}
              onChange={(e) => onUpdate({ mutua: e.target.value })}
            >
              <option value="">Selecciona mutua</option>
              {MUTUAS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.includes(`${prefix}mutua`) && (
              <div className={styles.errorMsg}>⚠ Selecciona la mutua.</div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              IBAN <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes(`${prefix}iban`) ? styles.error : ''}`}
              placeholder="ES00 0000 0000 0000 0000 0000"
              value={admin.iban}
              onChange={(e) => onUpdate({ iban: e.target.value.toUpperCase() })}
            />
            {errors.includes(`${prefix}iban`) && (
              <div className={styles.errorMsg}>⚠ Campo obligatorio.</div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>¿Solicitar tarifa reducida?</label>
            <div className={styles.radioInline}>
              <label
                className={`${styles.radioBtn} ${admin.tarifaReducida === true ? styles.selected : ''}`}
                onClick={() => onUpdate({ tarifaReducida: true })}
              >
                Sí
              </label>
              <label
                className={`${styles.radioBtn} ${admin.tarifaReducida === false ? styles.selected : ''}`}
                onClick={() => onUpdate({ tarifaReducida: false })}
              >
                No
              </label>
            </div>
            <div className={styles.infoNote} style={{ marginTop: 10 }}>
              <span className={styles.infoNoteIcon}>ℹ️</span>
              Disponible si no has sido autónomo en los últimos 2 años y no tienes deudas con la SS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TIPO_ADMIN_OPTIONS: { value: TipoAdministracion; title: string; desc: string }[] = [
  {
    value: 'solidarios',
    title: 'Administradores solidarios',
    desc: 'Cada administrador puede actuar de forma independiente en nombre de la sociedad.',
  },
  {
    value: 'mancomunados',
    title: 'Administradores mancomunados',
    desc: 'Todos los administradores deben actuar conjuntamente para obligar a la sociedad.',
  },
];

export default function Step06Administradores({ formData, onChange, errors }: Props) {
  const { tipoAdministracion, administradores } = formData;

  function updateAdmin(index: number, updates: Partial<Administrador>) {
    const next = administradores.map((a, i) => (i === index ? { ...a, ...updates } : a));
    onChange({ administradores: next });
  }

  function addAdmin() {
    if (administradores.length >= 3) return;
    onChange({ administradores: [...administradores, createEmptyAdministrador()] });
  }

  function removeAdmin(index: number) {
    onChange({ administradores: administradores.filter((_, i) => i !== index) });
  }

  return (
    <div>
      {/* Tipo de administración */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Tipo de administración <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioCards}>
          {TIPO_ADMIN_OPTIONS.map((op) => (
            <label
              key={op.value}
              className={`${styles.radioCard} ${tipoAdministracion === op.value ? styles.selected : ''}`}
              onClick={() => onChange({ tipoAdministracion: op.value })}
            >
              <div className={styles.radioCircle}>
                {tipoAdministracion === op.value && <div className={styles.radioDot} />}
              </div>
              <div className={styles.radioCardBody}>
                <div className={styles.radioCardTitle}>{op.title}</div>
                <div className={styles.radioCardDesc}>{op.desc}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.includes('tipoAdministracion') && (
          <div className={styles.errorMsg}>⚠ Selecciona el tipo de administración.</div>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        {administradores.map((admin, i) => (
          <AdminBlock
            key={admin.id}
            admin={admin}
            index={i}
            total={administradores.length}
            errors={errors}
            onUpdate={(u) => updateAdmin(i, u)}
            onRemove={() => removeAdmin(i)}
          />
        ))}

        {administradores.length < 3 && (
          <button type="button" className={styles.btnAdd} onClick={addAdmin}>
            + Añadir administrador
          </button>
        )}
      </div>
    </div>
  );
}
