'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AutonomoFormData, initialAutonomoFormData } from '@/lib/types-autonomo';
import { totalUploadBytes, formatMB, MAX_TOTAL_UPLOAD_BYTES } from '@/lib/file-upload';
import AutonomoStepIndicator from './AutonomoStepIndicator';
import AutoStep01DatosPersonales from './steps/AutoStep01DatosPersonales';
import AutoStep02Actividad from './steps/AutoStep02Actividad';
import AutoStep03SeguridadSocial from './steps/AutoStep03SeguridadSocial';
import AutoStep04Documentacion from './steps/AutoStep04Documentacion';
import AutoStep05Resumen from './steps/AutoStep05Resumen';
import styles from '../wizard.module.css';

const STEP_TITLES = [
  { title: 'Datos personales', subtitle: 'Tu información personal e identificación.' },
  { title: 'Información de la actividad', subtitle: 'Cuéntanos a qué te vas a dedicar como autónomo.' },
  { title: 'Seguridad Social', subtitle: 'Datos para gestionar tu alta en el RETA.' },
  { title: 'Documentación', subtitle: 'Adjunta los documentos necesarios para el trámite.' },
  { title: 'Resumen y envío', subtitle: 'Revisa todos los datos antes de enviar tu solicitud.' },
];

const TOTAL_STEPS = 5;

function validateStep(step: number, data: AutonomoFormData): string[] {
  const errors: string[] = [];

  if (step === 0) {
    if (!data.nombreCompleto.trim()) errors.push('nombreCompleto');
    if (!data.fechaNacimiento) errors.push('fechaNacimiento');
    if (!data.nacionalidad.trim()) errors.push('nacionalidad');
    if (!data.tipoDocumento) errors.push('tipoDocumento');
    if (!data.numeroDocumento.trim()) errors.push('numeroDocumento');
    if (!data.domicilio.calle.trim()) errors.push('dom_calle');
    if (!data.domicilio.numero.trim()) errors.push('dom_numero');
    if (!data.domicilio.cp || data.domicilio.cp.length !== 5) errors.push('dom_cp');
    if (!data.domicilio.municipio.trim()) errors.push('dom_municipio');
    if (!data.domicilio.provincia) errors.push('dom_provincia');
    if (data.mismoCentroActividad === null) errors.push('mismoCentroActividad');
    if (data.mismoCentroActividad === false) {
      if (!data.centroActividad.direccion.trim()) errors.push('centro_direccion');
      if (!data.centroActividad.cp || data.centroActividad.cp.length !== 5) errors.push('centro_cp');
      if (!data.centroActividad.municipio.trim()) errors.push('centro_municipio');
      if (!data.centroActividad.provincia) errors.push('centro_provincia');
      if (!data.centroActividad.m2.trim()) errors.push('centro_m2');
    }
    if (!data.telefono.trim()) errors.push('telefono');
    if (!data.email.trim() || !data.email.includes('@')) errors.push('email');
    if (!data.estadoCivil) errors.push('estadoCivil');
  }

  if (step === 1) {
    if (!data.descripcionActividad.trim()) errors.push('descripcionActividad');
    if (!data.cuantoAntes && !data.fechaInicio) errors.push('fechaInicio');
    if (data.roi === null) errors.push('roi');
    if (!data.epigrafeIAE.trim()) errors.push('epigrafeIAE');
  }

  if (step === 2) {
    if (!data.mutua) errors.push('mutua');
    if (!data.iban.trim()) errors.push('iban');
    if (!data.ingresosNetos.trim()) errors.push('ingresosNetos');
  }

  if (step === 3) {
    if (!data.dniAnverso) errors.push('dniAnverso');
    if (!data.dniReverso) errors.push('dniReverso');
    if (data.tipoDocumento === 'nie_extracomunitario' && !data.permisoTrabajo) {
      errors.push('permisoTrabajo');
    }
    const total = totalUploadBytes([data.dniAnverso, data.dniReverso, data.permisoTrabajo]);
    if (total > MAX_TOTAL_UPLOAD_BYTES) errors.push('totalArchivos');
  }

  if (step === 4) {
    if (!data.privacidad) errors.push('privacidad');
  }

  return errors;
}

export default function AutonomoFormWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<AutonomoFormData>(initialAutonomoFormData);

  function updateFormData(updates: Partial<AutonomoFormData>) {
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
      const total = totalUploadBytes([formData.dniAnverso, formData.dniReverso, formData.permisoTrabajo]);
      if (total > MAX_TOTAL_UPLOAD_BYTES) {
        throw new Error(
          `Los archivos adjuntos suman ${formatMB(total)} y el máximo son ` +
            `${formatMB(MAX_TOTAL_UPLOAD_BYTES)}. Vuelve al paso de documentación y ` +
            'sustituye alguno por una foto más ligera.',
        );
      }
      const res = await fetch('/api/autonomo', {
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
      router.push('/alta-autonomo/gracias');
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
      <AutonomoStepIndicator current={currentStep} />

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
          {currentStep === 0 && <AutoStep01DatosPersonales {...stepProps} />}
          {currentStep === 1 && <AutoStep02Actividad {...stepProps} />}
          {currentStep === 2 && <AutoStep03SeguridadSocial {...stepProps} />}
          {currentStep === 3 && <AutoStep04Documentacion {...stepProps} />}
          {currentStep === 4 && <AutoStep05Resumen {...stepProps} />}
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
              {submitting ? 'Enviando...' : 'Enviar solicitud →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
