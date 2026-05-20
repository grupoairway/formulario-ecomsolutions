'use client';

import { useRef } from 'react';
import { RentaFormData, FileAttachmentRenta } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';
import docStyles from './documentacion.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

const MAX_SIZE_MB = 8;

function FileUploadField({
  label,
  required,
  hint,
  value,
  errorKey,
  errors,
  onChange,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: FileAttachmentRenta | null;
  errorKey: string;
  errors: string[];
  onChange: (file: FileAttachmentRenta | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`El archivo es demasiado grande. El tamaño máximo es ${MAX_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ name: file.name, size: file.size, type: file.type, data: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const hasError = errors.includes(errorKey);

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      {value ? (
        <div className={docStyles.filePreview}>
          <span className={docStyles.fileIcon}>📄</span>
          <div className={docStyles.fileMeta}>
            <span className={docStyles.fileName}>{value.name}</span>
            <span className={docStyles.fileSize}>{(value.size / 1024).toFixed(0)} KB</span>
          </div>
          <button type="button" className={docStyles.fileRemove} onClick={handleRemove} aria-label="Eliminar archivo">
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`${docStyles.dropzone} ${hasError ? docStyles.dropzoneError : ''}`}
          onClick={() => inputRef.current?.click()}
        >
          <span className={docStyles.dropzoneIcon}>📎</span>
          <span className={docStyles.dropzoneText}>Haz clic para seleccionar archivo</span>
          <span className={docStyles.dropzoneHint}>JPG, PNG o PDF · Máx. {MAX_SIZE_MB} MB</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </div>
      )}
      {hasError && <div className={styles.errorMsg}>⚠ Este documento es obligatorio.</div>}
      {hint && !hasError && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

export default function RentaStep05Documentacion({ formData, onChange, errors }: Props) {
  return (
    <div>
      <div className={styles.infoNote} style={{ marginBottom: 24 }}>
        <span className={styles.infoNoteIcon}>🔒</span>
        <span>
          Tus documentos se transmiten de forma cifrada (HTTPS) y se tratan con total
          confidencialidad conforme al RGPD. Solo los utiliza el equipo de EcomSolutions para
          preparar tu declaración.
        </span>
      </div>

      {/* DNI */}
      <FileUploadField
        label="DNI/NIE — anverso (cara con foto)"
        required
        value={formData.dniAnverso}
        errorKey="dniAnverso"
        errors={errors}
        onChange={(f) => onChange({ dniAnverso: f })}
      />
      <FileUploadField
        label="DNI/NIE — reverso (cara con datos)"
        required
        value={formData.dniReverso}
        errorKey="dniReverso"
        errors={errors}
        onChange={(f) => onChange({ dniReverso: f })}
      />

      {/* Borrador Hacienda */}
      <FileUploadField
        label="Borrador de la declaración de Hacienda (opcional)"
        hint="Si dispones del borrador que te ha enviado la AEAT, adjúntalo aquí en PDF."
        value={formData.borradorHacienda}
        errorKey="borradorHacienda"
        errors={errors}
        onChange={(f) => onChange({ borradorHacienda: f })}
      />

      {/* Certificados de retenciones */}
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: 12, marginTop: 8 }}>
        Certificados de retenciones del trabajo
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 16, lineHeight: 1.5 }}>
        Adjunta uno por cada empresa o pagador. Lo encontrarás en el portal de tu empresa o puedes
        pedirlo al departamento de RRHH.
      </div>

      <FileUploadField
        label="Certificado de retenciones — pagador 1"
        hint="Certificado de tu empresa principal."
        value={formData.certificadoRetencion1}
        errorKey="certificadoRetencion1"
        errors={errors}
        onChange={(f) => onChange({ certificadoRetencion1: f })}
      />
      <FileUploadField
        label="Certificado de retenciones — pagador 2 (si aplica)"
        value={formData.certificadoRetencion2}
        errorKey="certificadoRetencion2"
        errors={errors}
        onChange={(f) => onChange({ certificadoRetencion2: f })}
      />
      <FileUploadField
        label="Certificado de retenciones — pagador 3 (si aplica)"
        value={formData.certificadoRetencion3}
        errorKey="certificadoRetencion3"
        errors={errors}
        onChange={(f) => onChange({ certificadoRetencion3: f })}
      />

      <div className={styles.infoNote} style={{ marginTop: 8 }}>
        <span className={styles.infoNoteIcon}>📧</span>
        <span>
          Si tienes más documentación (escrituras, contratos de alquiler, justificantes de
          donativos, etc.), puedes enviárnosla por{' '}
          <strong>email a info@ecomsolutions.es</strong> o por{' '}
          <strong>WhatsApp al 661 959 962</strong> una vez enviado el formulario.
        </span>
      </div>
    </div>
  );
}
