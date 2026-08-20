'use client';

import { useRef, useState } from 'react';
import { AutonomoFormData, FileAttachment } from '@/lib/types-autonomo';
import {
  compressImage,
  formatMB,
  isCompressible,
  readAsDataUrl,
  totalUploadBytes,
  MAX_IMAGE_INPUT_MB,
  MAX_PDF_MB,
  MAX_TOTAL_UPLOAD_BYTES,
} from '@/lib/file-upload';
import styles from '../../steps/steps.module.css';
import docStyles from './documentacion.module.css';

interface Props {
  formData: AutonomoFormData;
  onChange: (updates: Partial<AutonomoFormData>) => void;
  errors: string[];
}

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
  const [fileError, setFileError] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setFileError('');

    // ── PDF: no se puede comprimir en el navegador, tope duro ──────────────
    if (file.type === 'application/pdf') {
      if (file.size > MAX_PDF_MB * 1024 * 1024) {
        setFileError(
          `Este PDF pesa ${formatMB(file.size)} y el máximo son ${MAX_PDF_MB} MB. ` +
            'Los PDF no se pueden comprimir desde el navegador. Lo más rápido: haz ' +
            'una foto del documento con el móvil y súbela — esa sí se comprime sola.',
        );
        input.value = '';
        return;
      }
      setProcessing(true);
      try {
        onChange({
          name: file.name,
          size: file.size,
          type: file.type,
          data: await readAsDataUrl(file),
        });
      } catch {
        setFileError('No se pudo leer el archivo. Inténtalo de nuevo.');
      } finally {
        setProcessing(false);
        input.value = '';
      }
      return;
    }

    if (!isCompressible(file.type)) {
      setFileError('Formato no admitido. Sube una foto (JPG o PNG) o un PDF.');
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_INPUT_MB * 1024 * 1024) {
      setFileError(
        `La imagen pesa ${formatMB(file.size)} y el máximo son ${MAX_IMAGE_INPUT_MB} MB.`,
      );
      input.value = '';
      return;
    }

    // ── Imagen: se redimensiona y reencodea antes de tocar la red ──────────
    setProcessing(true);
    try {
      const c = await compressImage(file);
      console.log(
        `[upload] ${label}: ${formatMB(file.size)} → ${formatMB(c.size)} ` +
          `(payload ${c.dataUrl.length} bytes)`,
      );
      onChange({ name: c.name, size: c.size, type: c.type, data: c.dataUrl });
    } catch {
      setFileError('No se pudo procesar la imagen. Prueba con otra foto.');
    } finally {
      setProcessing(false);
      input.value = '';
    }
  }

  function handleRemove() {
    onChange(null);
    setFileError('');
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
          className={`${docStyles.dropzone} ${hasError || fileError ? docStyles.dropzoneError : ''}`}
          style={processing ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
          onClick={() => inputRef.current?.click()}
        >
          <span className={docStyles.dropzoneIcon}>{processing ? '⏳' : '📎'}</span>
          <span className={docStyles.dropzoneText}>
            {processing ? 'Optimizando imagen…' : 'Haz clic para seleccionar archivo'}
          </span>
          <span className={docStyles.dropzoneHint}>
            JPG o PNG hasta {MAX_IMAGE_INPUT_MB} MB · PDF hasta {MAX_PDF_MB} MB
          </span>
          <span className={docStyles.dropzoneHint}>
            Las fotos se optimizan solas: no hace falta que las reduzcas tú.
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </div>
      )}
      {fileError && <div className={styles.errorMsg}>⚠ {fileError}</div>}
      {hasError && (
        <div className={styles.errorMsg}>⚠ Este documento es obligatorio.</div>
      )}
      {hint && !hasError && !fileError && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

export default function AutoStep04Documentacion({ formData, onChange, errors }: Props) {
  const esExtracomunitario = formData.tipoDocumento === 'nie_extracomunitario';
  const adjuntos = [formData.dniAnverso, formData.dniReverso, formData.permisoTrabajo];
  const totalBytes = totalUploadBytes(adjuntos);
  const totalExcedido = errors.includes('totalArchivos');

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

      {totalExcedido && (
        <div className={styles.errorMsg} style={{ marginTop: 16 }}>
          ⚠ Los archivos suman {formatMB(totalBytes)} y el máximo que admite el envío
          son {formatMB(MAX_TOTAL_UPLOAD_BYTES)}. Sustituye alguno por una foto en vez
          de un PDF, o vuelve a hacer la foto con menos resolución.
        </div>
      )}

      {totalBytes > 0 && !totalExcedido && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 12 }}>
          Total adjunto: {formatMB(totalBytes)} de {formatMB(MAX_TOTAL_UPLOAD_BYTES)} disponibles.
        </div>
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
