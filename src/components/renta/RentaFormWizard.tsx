'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RentaFormData, initialRentaFormData } from '@/lib/types-renta';
import { validarNoFutura } from '@/lib/fechas';
import { totalUploadBytes, formatMB, MAX_TOTAL_UPLOAD_BYTES } from '@/lib/file-upload';
import RentaStepIndicator from './RentaStepIndicator';
import RentaStep01DatosPersonales from './steps/RentaStep01DatosPersonales';
import RentaStep02SituacionFamiliar from './steps/RentaStep02SituacionFamiliar';
import RentaStep03Ingresos from './steps/RentaStep03Ingresos';
import RentaStep04Deducciones from './steps/RentaStep04Deducciones';
import RentaStep05OtrasSituaciones from './steps/RentaStep05OtrasSituaciones';
import RentaStep06Documentacion from './steps/RentaStep06Documentacion';
import RentaStep07Resumen from './steps/RentaStep07Resumen';
import styles from '../wizard.module.css';

const STEP_TITLES = [
  { title: 'Datos personales', subtitle: 'Información personal e identificación del declarante.' },
  { title: 'Situación familiar', subtitle: 'Hijos, ascendientes y circunstancias personales.' },
  { title: 'Ingresos y retenciones', subtitle: 'Nóminas, pensiones, alquileres y otros ingresos del ejercicio.' },
  { title: 'Deducciones', subtitle: 'Vivienda, planes de pensiones, donativos y otras reducciones.' },
  { title: 'Otras situaciones', subtitle: 'Situaciones especiales, residencia en el extranjero y observaciones.' },
  { title: 'Documentación', subtitle: 'Adjunta el DNI y otros documentos necesarios para la tramitación.' },
  { title: 'Resumen y envío', subtitle: 'Revisa todos los datos y selecciona el ejercicio fiscal antes de enviar.' },
];

const TOTAL_STEPS = 7;

function validateStep(step: number, data: RentaFormData): string[] {
  const errors: string[] = [];

  if (step === 0) {
    if (!data.nombreCompleto.trim()) errors.push('nombreCompleto');
    if (!data.nif.trim()) errors.push('nif');
    if (!data.fechaNacimiento) {
      errors.push('fechaNacimiento');
    } else {
      // No se exige mayoría de edad: un menor puede tener obligación de declarar.
      const err = validarNoFutura(data.fechaNacimiento);
      if (err) errors.push(`fechaNacimiento_${err}`);
    }
    if (!data.estadoCivil) errors.push('estadoCivil');
    if (!data.declaracionTipo) errors.push('declaracionTipo');
    if (data.declaracionTipo === 'conjunta') {
      if (!data.conyuge.nombre.trim()) errors.push('conyuge_nombre');
      if (!data.conyuge.nif.trim()) errors.push('conyuge_nif');
    }
    if (!data.domicilio.calle.trim()) errors.push('dom_calle');
    if (!data.domicilio.numero.trim()) errors.push('dom_numero');
    if (!data.domicilio.cp || data.domicilio.cp.length !== 5) errors.push('dom_cp');
    if (!data.domicilio.municipio.trim()) errors.push('dom_municipio');
    if (!data.domicilio.provincia) errors.push('dom_provincia');
    if (!data.telefono.trim()) errors.push('telefono');
    if (!data.email.trim() || !data.email.includes('@')) errors.push('email');
    if (data.cambioDomicilio === null) errors.push('cambioDomicilio');
    if (!data.claveCertificado) errors.push('claveCertificado');
  }

  if (step === 1) {
    if (data.hijos.some((h) => h.fechaNacimiento && validarNoFutura(h.fechaNacimiento))) {
      errors.push('hijos_fecha');
    }
  }

  if (step === 5) {
    if (!data.dniAnverso) errors.push('dniAnverso');
    if (!data.dniReverso) errors.push('dniReverso');
    const total = totalUploadBytes([data.dniAnverso, data.dniReverso, data.borradorHacienda]);
    if (total > MAX_TOTAL_UPLOAD_BYTES) errors.push('totalArchivos');
  }

  if (step === 6) {
    if (!data.ejercicioFiscal) errors.push('ejercicioFiscal');
    if (!data.privacidad) errors.push('privacidad');
  }

  return errors;
}

export default function RentaFormWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<RentaFormData>(initialRentaFormData);

  function updateFormData(updates: Partial<RentaFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  function handleNext() {
    const errs = validateStep(currentStep, formData);
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrev() {
    setErrors([]);
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    const errs = validateStep(currentStep, formData);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    setSubmitError('');
    try {
      // Guarda final: el cuerpo debe caber en el límite de la plataforma o la
      // petición muere con 413 antes de llegar a la API.
      const total = totalUploadBytes([formData.dniAnverso, formData.dniReverso, formData.borradorHacienda]);
      if (total > MAX_TOTAL_UPLOAD_BYTES) {
        throw new Error(
          `Los archivos adjuntos suman ${formatMB(total)} y el máximo son ` +
            `${formatMB(MAX_TOTAL_UPLOAD_BYTES)}. Vuelve al paso de documentación y ` +
            'sustituye alguno por una foto más ligera.',
        );
      }
      const res = await fetch('/api/renta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        // 413 lo genera la plataforma, no la API: el cuerpo es text/plain y
        // res.json() falla, así que sin este caso el cliente solo veía
        // "Error al enviar el formulario" y reintentaba a ciegas para siempre.
        if (res.status === 413) {
          throw new Error(
            'Los archivos adjuntos son demasiado grandes para enviarse. Vuelve al ' +
              'paso de documentación y sube fotos más ligeras (o haz la foto de nuevo ' +
              'con menos resolución).',
          );
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Error al enviar el formulario.');
      }
      router.push('/declaracion-renta/gracias');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error inesperado. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const progressPct = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
  const { title, subtitle } = STEP_TITLES[currentStep];
  const stepProps = { formData, onChange: updateFormData, errors };

  return (
    <div>
      <RentaStepIndicator current={currentStep} />

      <div className={styles.progressBar} style={{ marginTop: 20 }}>
        <div className={styles.progressMeta}>
          <span className={styles.progressLabel}>Progreso</span>
          <span className={styles.progressPercent}>{progressPct}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.stepTitle}>{title}</h2>
        <p className={styles.stepSubtitle}>{subtitle}</p>

        {errors.length > 0 && (
          <div className={styles.errorBanner}>
            <span className={styles.errorBannerIcon}>⚠️</span>
            <span className={styles.errorBannerText}>
              Por favor, corrige los campos marcados antes de continuar.
            </span>
          </div>
        )}

        {submitError && (
          <div className={styles.errorBanner}>
            <span className={styles.errorBannerIcon}>❌</span>
            <span className={styles.errorBannerText}>{submitError}</span>
          </div>
        )}

        <div className={styles.stepContent}>
          {currentStep === 0 && <RentaStep01DatosPersonales {...stepProps} />}
          {currentStep === 1 && <RentaStep02SituacionFamiliar {...stepProps} />}
          {currentStep === 2 && <RentaStep03Ingresos {...stepProps} />}
          {currentStep === 3 && <RentaStep04Deducciones {...stepProps} />}
          {currentStep === 4 && <RentaStep05OtrasSituaciones {...stepProps} />}
          {currentStep === 5 && <RentaStep06Documentacion {...stepProps} />}
          {currentStep === 6 && <RentaStep07Resumen {...stepProps} />}
        </div>

        <div className={styles.nav}>
          {currentStep > 0 ? (
            <button type="button" className={styles.btnPrev} onClick={handlePrev}>
              ← Anterior
            </button>
          ) : (
            <span className={styles.spacer} />
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <button type="button" className={styles.btnNext} onClick={handleNext}>
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnSubmit}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Enviando...' : 'Enviar declaración →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
