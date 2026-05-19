'use client';

import { FormData, MetodoDenominacion } from '@/lib/types';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

const OPCIONES: { value: MetodoDenominacion; title: string; desc: string }[] = [
  {
    value: 'nuevo',
    title: 'Quiero elegir un nombre nuevo',
    desc: 'Propones hasta 5 nombres y el Registro los aprueba por orden de preferencia.',
  },
  {
    value: 'bolsa',
    title: 'Escoger nombre de la bolsa del Registro Mercantil',
    desc: 'Usa un nombre disponible de la bolsa oficial del Registro Mercantil Central.',
  },
  {
    value: 'certificado',
    title: 'Ya tengo el certificado de denominación',
    desc: 'Ya obtuve la certificación negativa de denominación y puedo aportar el nombre.',
  },
];

export default function Step01Denominacion({ formData, onChange, errors }: Props) {
  const { metodoDenominacion, denominaciones, nombreBolsa, denominacionCertificada } = formData;

  function setMetodo(v: MetodoDenominacion) {
    onChange({ metodoDenominacion: v });
  }

  function setDenominacion(i: number, v: string) {
    const next = [...denominaciones] as FormData['denominaciones'];
    next[i] = v;
    onChange({ denominaciones: next });
  }

  return (
    <div>
      {/* Selección de método */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          ¿Cómo quieres elegir el nombre de tu sociedad? <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioCards}>
          {OPCIONES.map((op) => (
            <label
              key={op.value}
              className={`${styles.radioCard} ${metodoDenominacion === op.value ? styles.selected : ''}`}
              onClick={() => setMetodo(op.value)}
            >
              <div className={styles.radioCircle}>
                {metodoDenominacion === op.value && <div className={styles.radioDot} />}
              </div>
              <div className={styles.radioCardBody}>
                <div className={styles.radioCardTitle}>{op.title}</div>
                <div className={styles.radioCardDesc}>{op.desc}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.includes('metodoDenominacion') && (
          <div className={styles.errorMsg}>⚠ Selecciona cómo quieres elegir el nombre.</div>
        )}
      </div>

      {/* Subformulario según método */}
      {metodoDenominacion === 'nuevo' && (
        <div>
          <div className={styles.infoNote}>
            <span className={styles.infoNoteIcon}>ℹ️</span>
            Los nombres se concederán según el orden indicado. Si el primero no se acepta,
            pasaremos al siguiente.
          </div>
          <div style={{ marginTop: 20 }}>
            {(['1ª opción', '2ª opción', '3ª opción', '4ª opción', '5ª opción'] as const).map(
              (label, i) => (
                <div className={styles.fieldGroup} key={i}>
                  <label className={styles.label}>
                    {label} {i === 0 && <span className={styles.required}>*</span>}
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.includes('denominacion0') && i === 0 ? styles.error : ''}`}
                    placeholder={`Nombre ${i + 1} para la sociedad`}
                    value={denominaciones[i]}
                    onChange={(e) => setDenominacion(i, e.target.value)}
                  />
                </div>
              )
            )}
          </div>
          {errors.includes('denominacion0') && (
            <div className={styles.errorMsg}>⚠ La 1ª opción de denominación es obligatoria.</div>
          )}
        </div>
      )}

      {metodoDenominacion === 'bolsa' && (
        <div style={{ marginTop: 20 }}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Nombre seleccionado de la bolsa <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes('nombreBolsa') ? styles.error : ''}`}
              placeholder="Escribe el nombre exacto de la bolsa"
              value={nombreBolsa}
              onChange={(e) => onChange({ nombreBolsa: e.target.value })}
            />
            {errors.includes('nombreBolsa') && (
              <div className={styles.errorMsg}>⚠ Introduce el nombre seleccionado de la bolsa.</div>
            )}
          </div>
          <div className={styles.infoNote}>
            <span className={styles.infoNoteIcon}>🔗</span>
            <span>
              <a
                href="https://www.rmc.es/privado/BolsaDBeneficiario.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver bolsa del Registro Mercantil →
              </a>
            </span>
          </div>
        </div>
      )}

      {metodoDenominacion === 'certificado' && (
        <div style={{ marginTop: 20 }}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Denominación social certificada <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.includes('denominacionCertificada') ? styles.error : ''}`}
              placeholder="Nombre exacto del certificado"
              value={denominacionCertificada}
              onChange={(e) => onChange({ denominacionCertificada: e.target.value })}
            />
            {errors.includes('denominacionCertificada') && (
              <div className={styles.errorMsg}>⚠ Introduce la denominación del certificado.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
