'use client';

import { AutonomoFormData } from '@/lib/types-autonomo';
import { MUTUAS } from '@/lib/types';
import styles from '../../steps/steps.module.css';

interface Props {
  formData: AutonomoFormData;
  onChange: (updates: Partial<AutonomoFormData>) => void;
  errors: string[];
}

const tarifaReducida = (data: AutonomoFormData) => data.noAltaDosAnios && data.sinDeudasSS;

export default function AutoStep03SeguridadSocial({ formData, onChange, errors }: Props) {
  const { numeroAfiliacionSS, mutua, iban, ingresosNetos, noAltaDosAnios, sinDeudasSS } = formData;

  return (
    <div>
      {/* Número de afiliación SS */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Número de afiliación a la Seguridad Social</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Ej: 28/123456789/00"
          value={numeroAfiliacionSS}
          onChange={(e) => onChange({ numeroAfiliacionSS: e.target.value })}
        />
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          Si no lo tienes a mano o nunca has cotizado en España, déjalo en blanco.
          Nosotros lo consultamos por ti en el sistema de la TGSS.
        </div>
      </div>

      {/* Mutua */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Mutua colaboradora con la SS <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.select} ${errors.includes('mutua') ? styles.error : ''}`}
          value={mutua}
          onChange={(e) => onChange({ mutua: e.target.value })}
        >
          <option value="">Selecciona mutua</option>
          {MUTUAS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {errors.includes('mutua') && (
          <div className={styles.errorMsg}>⚠ Selecciona la mutua colaboradora.</div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          La mutua cubre las bajas por contingencias comunes y accidentes de trabajo.
          Las más habituales para autónomos son Asepeyo, FREMAP y Umivale Activa.
          Si no tienes preferencia, te recomendamos Asepeyo.
        </div>
      </div>

      {/* IBAN */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          IBAN para domiciliación de la cuota <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          inputMode="text"
          className={`${styles.input} ${errors.some((e) => e.startsWith('iban')) ? styles.error : ''}`}
          placeholder="ES00 0000 0000 0000 0000 0000"
          value={iban}
          onChange={(e) => onChange({ iban: e.target.value.toUpperCase() })}
        />
        {errors.includes('iban') && (
          <div className={styles.errorMsg}>⚠ Introduce el IBAN de la cuenta donde se domiciliará la cuota.</div>
        )}
        {errors.includes('iban_formato') && (
          <div className={styles.errorMsg}>
            ⚠ Un IBAN español empieza por ES seguido de 22 cifras (24 caracteres en total).
            Revisa que no falte ni sobre ningún número.
          </div>
        )}
        {errors.includes('iban_digitoControl') && (
          <div className={styles.errorMsg}>
            ⚠ Ese IBAN no es correcto: tiene la longitud adecuada pero no supera la
            comprobación del banco. Suele ser una cifra cambiada de sitio; cópialo de tu
            app bancaria para asegurarte.
          </div>
        )}
      </div>

      {/* Ingresos netos estimados */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Ingresos netos mensuales esperados (€) <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.includes('ingresosNetos') ? styles.error : ''}`}
          placeholder="Ej: 1500"
          value={ingresosNetos}
          onChange={(e) => onChange({ ingresosNetos: e.target.value })}
        />
        {errors.includes('ingresosNetos') && (
          <div className={styles.errorMsg}>⚠ Indica los ingresos netos mensuales estimados.</div>
        )}
        <div className={styles.infoNote} style={{ marginTop: 10 }}>
          <span className={styles.infoNoteIcon}>ℹ️</span>
          Desde 2023, la cuota de autónomo se calcula según tus ingresos reales netos anuales
          (rendimiento neto = ingresos − gastos). La cuota va de{' '}
          <strong>200€/mes (ingresos &lt; 670€)</strong> hasta{' '}
          <strong>590€/mes (ingresos &gt; 6.000€)</strong>. Puedes cambiar el tramo
          cada dos meses según evolucionen tus ingresos.
        </div>
      </div>

      {/* Tarifa reducida */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>¿Cumples los requisitos para la cuota reducida de 80€/mes?</label>
        <div style={{ marginTop: 8, marginBottom: 12 }}>
          <div
            className={`${styles.checkboxRow} ${noAltaDosAnios ? styles.checked : ''}`}
            style={{ marginBottom: 10 }}
            onClick={() => onChange({ noAltaDosAnios: !noAltaDosAnios })}
          >
            <div className={styles.checkbox}>{noAltaDosAnios && '✓'}</div>
            <span className={styles.checkboxLabel}>
              No he estado dado/a de alta como autónomo/a en los 2 últimos años
              (o 3 años si disfruté de tarifa reducida anteriormente)
            </span>
          </div>
          <div
            className={`${styles.checkboxRow} ${sinDeudasSS ? styles.checked : ''}`}
            onClick={() => onChange({ sinDeudasSS: !sinDeudasSS })}
          >
            <div className={styles.checkbox}>{sinDeudasSS && '✓'}</div>
            <span className={styles.checkboxLabel}>
              No tengo deudas pendientes con la Seguridad Social ni con Hacienda
            </span>
          </div>
        </div>
        {tarifaReducida(formData) ? (
          <div
            className={styles.capitalTotal}
            style={{ background: 'var(--color-success-light)', borderColor: 'var(--color-success-border)' }}
          >
            <span className={styles.capitalLabel}>¡Enhorabuena! Tienes derecho a la tarifa reducida</span>
            <span className={styles.capitalAmount}>80€/mes</span>
          </div>
        ) : (
          <div className={styles.infoNote}>
            <span className={styles.infoNoteIcon}>ℹ️</span>
            La cuota reducida (80€/mes) aplica durante el primer año y se puede prorrogar
            un segundo año si los ingresos son inferiores al SMI. Para disfrutarla hay que
            cumplir ambos requisitos marcados arriba.
          </div>
        )}
      </div>
    </div>
  );
}
