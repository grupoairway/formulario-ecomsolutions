'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, DireccionDetallada, initialFormData, createEmptySocio, createEmptyAdministrador } from '@/lib/types';
import StepIndicator from './StepIndicator';
import Step01Denominacion from './steps/Step01Denominacion';
import Step02Empresa from './steps/Step02Empresa';
import Step03Domicilio from './steps/Step03Domicilio';
import Step04CentroActividad from './steps/Step04CentroActividad';
import Step05Socios from './steps/Step05Socios';
import Step06Administradores from './steps/Step06Administradores';
import Step07Resumen from './steps/Step07Resumen';
import styles from './wizard.module.css';

const STEP_TITLES = [
  { title: 'Denominación social', subtitle: 'Elige el nombre para tu Sociedad Limitada.' },
  { title: 'Información de la empresa', subtitle: 'Cuéntanos a qué se dedicará tu sociedad.' },
  { title: 'Domicilio social', subtitle: 'Domicilio oficial de la sociedad ante el Registro.' },
  { title: 'Centro de actividad', subtitle: 'Lugar desde donde ejercerás la actividad habitualmente.' },
  { title: 'Socios', subtitle: 'Personas o entidades que forman la sociedad y sus aportaciones.' },
  { title: 'Administradores', subtitle: 'Quién gestiona y representa legalmente la sociedad.' },
  { title: 'Resumen y envío', subtitle: 'Revisa todos los datos antes de enviar tu solicitud.' },
];

const TOTAL_STEPS = 7;

function validateDireccion(dir: DireccionDetallada, prefix: string, errors: string[]) {
  if (!dir.tipoVia) errors.push(`${prefix}tipoVia`);
  if (!dir.nombreVia.trim()) errors.push(`${prefix}nombreVia`);
  if (!dir.numero.trim()) errors.push(`${prefix}numero`);
  if (!dir.provincia) errors.push(`${prefix}provincia`);
  if (!dir.municipio.trim()) errors.push(`${prefix}municipio`);
  if (!dir.codigoPostal || dir.codigoPostal.length !== 5) errors.push(`${prefix}codigoPostal`);
  // bloque / piso / puerta son opcionales
}

function validateStep(step: number, data: FormData): string[] {
  const errors: string[] = [];

  if (step === 0) {
    if (!data.metodoDenominacion) errors.push('metodoDenominacion');
    else if (data.metodoDenominacion === 'nuevo' && !data.denominaciones[0].trim())
      errors.push('denominacion0');
    else if (data.metodoDenominacion === 'bolsa' && !data.nombreBolsa.trim())
      errors.push('nombreBolsa');
    else if (data.metodoDenominacion === 'certificado' && !data.denominacionCertificada.trim())
      errors.push('denominacionCertificada');
  }

  if (step === 1) {
    if (!data.actividadPrincipal.trim()) errors.push('actividadPrincipal');
    if (data.roi === null) errors.push('roi');
    if (!data.cierreEjercicio.trim()) errors.push('cierreEjercicio');
    if (data.duracionSociedad === 'determinada' && !data.duracionAnios.trim())
      errors.push('duracionAnios');
  }

  if (step === 2) {
    validateDireccion(data.domicilio.direccion, 'dom_', errors);
    if (!data.domicilio.superficie) errors.push('dom_superficie');
    if (!data.domicilio.porcentajeActividad) errors.push('dom_porcentajeActividad');
  }

  if (step === 3) {
    if (data.mismoCentroActividad === null) errors.push('mismoCentroActividad');
    if (data.mismoCentroActividad === false) {
      validateDireccion(data.centroActividad.direccion, 'centro_', errors);
      if (!data.centroActividad.superficie) errors.push('centro_superficie');
      if (!data.centroActividad.porcentajeActividad) errors.push('centro_porcentajeActividad');
    }
  }

  if (step === 4) {
    // Capital social: obligatorio y > 0 (bloqueante). El DESCUADRE con la suma de
    // aportaciones NO bloquea: solo se muestra como aviso visible en el paso.
    const capital = parseFloat((data.capitalSocial || '').replace(',', '.'));
    if (!data.capitalSocial.trim() || isNaN(capital) || capital <= 0) errors.push('capitalSocial');

    if (data.socios.length === 0) errors.push('socios_empty');
    data.socios.forEach((s, i) => {
      const p = `socio${i}_`;
      const esFisica = s.tipo !== 'sociedad';
      if (!s.nombre.trim()) errors.push(`${p}nombre`);
      if (esFisica && !s.primerApellido.trim()) errors.push(`${p}primerApellido`);
      if (esFisica && !s.sexo) errors.push(`${p}sexo`);
      if (!s.documento.trim()) errors.push(`${p}documento`);
      if (i === 0 && !s.email.trim()) errors.push(`${p}email`);
      if (!s.fechaNacimientoConstitucion) errors.push(`${p}fecha`);
      if (!s.nacionalidad.trim()) errors.push(`${p}nacionalidad`);
      if (esFisica && !s.estadoCivil) errors.push(`${p}estadoCivil`);
      if (!esFisica) {
        if (!s.fechaInscripcion) errors.push(`${p}fechaInscripcion`);
        if (!s.representanteNombre.trim()) errors.push(`${p}representanteNombre`);
        if (!s.representanteDocumento.trim()) errors.push(`${p}representanteDocumento`);
      }
      if (!s.mismoDomicilio) validateDireccion(s.direccion, `${p}dir_`, errors);
      if (!s.tipoAportacion) errors.push(`${p}tipoAportacion`);
      if (s.tipoAportacion) {
        const imp = parseFloat((s.importeAportacion || '').replace(',', '.'));
        if (!s.importeAportacion.trim() || isNaN(imp) || imp <= 0) errors.push(`${p}importe`);
        if (s.tipoAportacion === 'no_dineraria' && !s.descripcionBienes.trim())
          errors.push(`${p}descripcionBienes`);
      }
    });
  }

  if (step === 5) {
    if (!data.tipoAdministracion) errors.push('tipoAdministracion');
    if (data.administradores.length === 0) errors.push('admins_empty');
    data.administradores.forEach((a, i) => {
      const p = `admin${i}_`;
      if (!a.nombre.trim()) errors.push(`${p}nombre`);
      if (!a.documento.trim()) errors.push(`${p}documento`);
      if (a.cobranRetribucion === null) errors.push(`${p}cobranRetribucion`);
      if (a.esAutonomoSocietario === null) errors.push(`${p}esAutonomoSocietario`);
      if (a.esAutonomoSocietario === true) {
        if (!a.numeroAfiliacionSS.trim()) errors.push(`${p}numeroAfiliacionSS`);
        if (!a.mutua) errors.push(`${p}mutua`);
        if (!a.iban.trim()) errors.push(`${p}iban`);
      }
    });
  }

  if (step === 6) {
    if (!data.confirmacion) errors.push('confirmacion');
  }

  return errors;
}

export default function FormWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [formData, setFormData] = useState<FormData>(() => ({
    ...initialFormData,
    socios: [createEmptySocio()],
    administradores: [createEmptyAdministrador()],
  }));

  // Lee ?cliente=NOTION_PAGE_ID de la URL para enlazar el registro con el Cliente
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('cliente') || '';
    if (id) setClienteId(id);
  }, []);

  function updateFormData(updates: Partial<FormData>) {
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
      const res = await fetch('/api/constitucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, clienteId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Error al enviar el formulario.');
      }
      router.push('/constitucion-sl/gracias');
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
      {/* Indicador de pasos */}
      <StepIndicator current={currentStep} />

      {/* Barra de progreso */}
      <div className={styles.progressBar} style={{ marginTop: 20 }}>
        <div className={styles.progressMeta}>
          <span className={styles.progressLabel}>Progreso</span>
          <span className={styles.progressPercent}>{progressPct}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Tarjeta */}
      <div className={styles.card}>
        <h2 className={styles.stepTitle}>{title}</h2>
        <p className={styles.stepSubtitle}>{subtitle}</p>

        {/* Errores */}
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
          {currentStep === 0 && <Step01Denominacion {...stepProps} />}
          {currentStep === 1 && <Step02Empresa {...stepProps} />}
          {currentStep === 2 && <Step03Domicilio {...stepProps} />}
          {currentStep === 3 && <Step04CentroActividad {...stepProps} />}
          {currentStep === 4 && <Step05Socios {...stepProps} />}
          {currentStep === 5 && <Step06Administradores {...stepProps} />}
          {currentStep === 6 && <Step07Resumen {...stepProps} />}
        </div>

        {/* Navegación */}
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
