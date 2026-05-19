'use client';

import { useRef } from 'react';
import { AutonomoFormData, FileAttachment } from '@/lib/types-autonomo';
import styles from '../../steps/steps.module.css';
import docStyles from './documentacion.module.css';

interface Props {
  formData: AutonomoFormData;
  onChange: (updates: Partial<AutonomoFormData>) => void;
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
  value: FileAttachment | null;
  errorKey: string;
  errors: string[];
  onChange: (file: FileAttachment | null) => void;
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
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result as string,
      });
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
            <span className={docStyles.fileSize}>
              {(value.size / 1024).toFixed(0)} KB
            </span>
          </div>
          <button
            type="button"
            className={docStyles.fileRemove}
            onClick={handleRemove}
            aria-label="Eliminar archivo"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`${docStyles.dropzone} ${hasError ? docStyles.dropzoneError : ''}`}
          onClick={() => inputRef.current?.click()}
        >
          <span className={docStyles.dropzoneIcon}>📎</span>
          <span className={docStyles.dropzoneText}>
            Haz clic para seleccionar archivo
          </span>
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
      {hasError && (
        <div className={styles.errorMsg}>⚠ Este documento es obligatorio.</div>
      )}
      {hint && !hasError && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

export default function AutoStep04Documentacion({ formData, onChange, errors }: Props) {
  const esExtracomunitario = formData.tipoDocumento === 'nie_extracomunitario';

  return (
    <div>
      <div className={styles.infoNote} style={{ marginBottom: 24 }}>
        <span className={styles.infoNoteIcon}>🔒</span>
        <span>
          Tus documentos se transmiten de forma cifrada (HTTPS) y se tratan con total
          confidencialidad, conforme al RGPD. Solo los utiliza el equipo de EcomSolutions
          para gestionar tu alta.
        </span>
      </div>

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

      {esExtracomunitario && (
        <FileUploadField
          label="Permiso de trabajo o tarjeta de residencia en vigor"
          required
          hint="Necesario para tramitar el alta como autónomo con NIE extracomunitario."
          value={formData.permisoTrabajo}
          errorKey="permisoTrabajo"
          errors={errors}
          onChange={(f) => onChange({ permisoTrabajo: f })}
        />
      )}

      <div className={styles.infoNote} style={{ marginTop: 8 }}>
        <span className={styles.infoNoteIcon}>📝</span>
        <span>
          Además de estos documentos, necesitarás firmar el{' '}
          <strong>mandato SEPA</strong> para que la Seguridad Social pueda domiciliar tu
          cuota mensual. Te lo enviaremos por email en cuanto recibamos tu solicitud.
        </span>
      </div>
    </div>
  );
}
