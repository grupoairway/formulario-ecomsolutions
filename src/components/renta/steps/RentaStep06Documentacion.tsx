'use client';

import { useRef } from 'react';
import { RentaFormData, FileAttachmentRenta, DocStatus } from '@/lib/types-renta';
import styles from '../../steps/steps.module.css';
import docStyles from './documentacion.module.css';

interface Props {
  formData: RentaFormData;
  onChange: (updates: Partial<RentaFormData>) => void;
  errors: string[];
}

function readFile(file: File): Promise<FileAttachmentRenta> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type, data: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fmt(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileUpload({
  label, hint, file, onFile, onRemove, required, hasError,
}: {
  label: string; hint?: string; file: FileAttachmentRenta | null;
  onFile: (f: FileAttachmentRenta) => void; onRemove: () => void;
  required?: boolean; hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const att = await readFile(f);
    onFile(att);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (file) {
    return (
      <div className={docStyles.filePreview}>
        <span className={docStyles.fileIcon}>📄</span>
        <div className={docStyles.fileMeta}>
          <span className={docStyles.fileName}>{file.name}</span>
          <span className={docStyles.fileSize}>{fmt(file.size)}</span>
        </div>
        <button type="button" className={docStyles.fileRemove} onClick={onRemove} aria-label="Eliminar">✕</button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`${docStyles.dropzone} ${hasError ? docStyles.dropzoneError : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <span className={docStyles.dropzoneIcon}>📎</span>
        <span className={docStyles.dropzoneText}>{label}{required && ' *'}</span>
        {hint && <span className={docStyles.dropzoneHint}>{hint}</span>}
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleChange} />
    </>
  );
}

interface DocItem { key: string; label: string; hint?: string; }

function buildDocList(data: RentaFormData): DocItem[] {
  const docs: DocItem[] = [];

  if (data.tieneNominas) {
    docs.push({ key: 'cert_retenciones', label: 'Certificado de retenciones del pagador (empresa/s)', hint: 'Emitido por cada empresa pagadora' });
  }
  if (data.tieneDesempleo) {
    docs.push({ key: 'cert_desempleo', label: 'Certificado de prestación por desempleo (SEPE)' });
  }
  if (data.tienePension) {
    docs.push({ key: 'cert_pension', label: 'Certificado de pensión o jubilación (INSS / mutualidad)' });
  }
  if (data.tieneIncapacidadTemporal) {
    docs.push({ key: 'cert_it', label: 'Certificado de prestación por incapacidad temporal (baja)' });
  }
  if (data.tieneMaternidadPaternidad) {
    docs.push({ key: 'cert_maternidad', label: 'Certificado de prestación por maternidad/paternidad' });
  }
  if (data.tieneAutonomo) {
    docs.push({ key: 'libro_registro', label: 'Libro registro de ingresos y gastos (autónomo)', hint: 'O resumen de facturación del ejercicio' });
    docs.push({ key: 'recibos_ss', label: 'Recibos de cuotas a la Seguridad Social (autónomos)' });
  }
  if (data.tieneInmuebles) {
    docs.push({ key: 'ref_catastral', label: 'Referencia catastral de los inmuebles en propiedad' });
  }
  if (data.inmuebles.some((i) => i.uso === 'alquilado')) {
    docs.push({ key: 'contratos_alquiler', label: 'Contratos y recibos de arrendamiento (inmuebles alquilados)', hint: 'Ingresos y gastos deducibles del alquiler' });
  }
  if (data.tieneCuentasExtranjero) {
    docs.push({ key: 'extracto_extranjero', label: 'Extracto o certificado de cuentas en el extranjero (Modelo 720 si aplica)' });
  }
  if (data.tieneDividendosExtranjero) {
    docs.push({ key: 'cert_dividendos_ext', label: 'Certificado de dividendos obtenidos en el extranjero' });
  }
  if (data.tieneRentasExtranjero) {
    docs.push({ key: 'cert_rentas_ext', label: 'Certificado de rentas obtenidas en el extranjero y retenciones aplicadas' });
  }
  if (data.tieneCripto) {
    docs.push({ key: 'informe_cripto', label: 'Informe de operaciones con criptomonedas', hint: 'Exportado del exchange o cartera' });
  }
  if (data.tieneGanancias) {
    docs.push({ key: 'docs_ganancias', label: 'Documentación de ganancias/pérdidas patrimoniales', hint: 'Escrituras, contratos de compraventa, etc.' });
  }
  if (data.tienePerdidasAnteriores) {
    docs.push({ key: 'docs_perdidas', label: 'Declaraciones de ejercicios anteriores con saldos negativos pendientes' });
  }
  if (data.tienePlanPensiones || data.tienePPA) {
    docs.push({ key: 'justif_pensiones', label: 'Justificante de aportaciones al plan de pensiones / PPA' });
  }
  if (data.tieneAportacionConyuge) {
    docs.push({ key: 'justif_pension_conyuge', label: 'Justificante de aportación al plan de pensiones del cónyuge' });
  }
  if (data.tieneSeguroDependencia) {
    docs.push({ key: 'justif_dependencia', label: 'Justificante del seguro de dependencia' });
  }
  if (data.viviendaHabitual2013) {
    docs.push({ key: 'escritura_vivienda', label: 'Escritura de compraventa o contrato hipoteca vivienda habitual (anterior a 2013)', hint: 'Para deducción por inversión en vivienda' });
  }
  if (data.alquilerAntes2015) {
    docs.push({ key: 'contrato_alquiler_inquilino', label: 'Contrato de alquiler como inquilino (anterior a 2015)', hint: 'Para deducción estatal por alquiler' });
  }
  if (data.clausulaSupelo) {
    docs.push({ key: 'acuerdo_suelo', label: 'Resolución judicial o acuerdo extrajudicial de cláusula suelo' });
  }
  if (data.tieneDonativos) {
    docs.push({ key: 'justif_donativos', label: 'Justificante o certificado de donativos realizados' });
  }
  if (data.tieneGuarderia) {
    docs.push({ key: 'facturas_guarderia', label: 'Facturas o recibos de la guardería (0–3 años)' });
  }
  if (data.tieneInversionNuevaEmpresa) {
    docs.push({ key: 'docs_inversion', label: 'Documentación de inversión en nueva empresa (escritura / certificado sociedad)' });
  }
  if (data.tieneBasesNegativas) {
    docs.push({ key: 'docs_bases_neg', label: 'Declaraciones o resoluciones con bases imponibles negativas pendientes' });
  }
  if (data.tieneOperacionesVinculadas) {
    docs.push({ key: 'docs_vinculadas', label: 'Documentación de operaciones vinculadas con sociedades propias' });
  }

  return docs;
}

function DocEntregaRow({
  item, status, onChange,
}: { item: DocItem; status: DocStatus; onChange: (v: DocStatus) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{item.label}</div>
        {item.hint && <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{item.hint}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid',
            borderColor: status === 'adjuntado' ? 'var(--color-blue-border)' : 'var(--color-border)',
            background: status === 'adjuntado' ? 'var(--color-blue-light)' : 'transparent',
            color: status === 'adjuntado' ? 'var(--color-blue)' : 'var(--color-muted)',
            whiteSpace: 'nowrap',
          }}
          onClick={() => onChange(status === 'adjuntado' ? '' : 'adjuntado')}
        >
          {status === 'adjuntado' ? '✓ ' : ''}Adjunto aquí
        </label>
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid',
            borderColor: status === 'email' ? '#16a34a' : 'var(--color-border)',
            background: status === 'email' ? '#f0fdf4' : 'transparent',
            color: status === 'email' ? '#16a34a' : 'var(--color-muted)',
            whiteSpace: 'nowrap',
          }}
          onClick={() => onChange(status === 'email' ? '' : 'email')}
        >
          {status === 'email' ? '✓ ' : ''}Por email / WhatsApp
        </label>
      </div>
    </div>
  );
}

export default function RentaStep06Documentacion({ formData, onChange, errors }: Props) {
  function setDoc(key: string, val: FileAttachmentRenta | null, field: 'dniAnverso' | 'dniReverso' | 'borradorHacienda') {
    onChange({ [field]: val });
  }

  function setEntrega(key: string, val: DocStatus) {
    onChange({ documentosEntrega: { ...formData.documentosEntrega, [key]: val } });
  }

  const docList = buildDocList(formData);

  return (
    <div>
      {/* DNI obligatorio */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: 4 }}>
          DNI / NIE <span style={{ color: 'var(--color-error)' }}>*</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 16 }}>
          Adjunta ambas caras de tu documento de identidad en vigor.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div className={styles.label} style={{ marginBottom: 6 }}>Cara frontal (anverso)</div>
            <FileUpload
              label="Sube el anverso del DNI"
              file={formData.dniAnverso}
              onFile={(f) => setDoc('dniAnverso', f, 'dniAnverso')}
              onRemove={() => setDoc('dniAnverso', null, 'dniAnverso')}
              required
              hasError={errors.includes('dniAnverso')}
            />
            {errors.includes('dniAnverso') && <div className={styles.errorMsg}>⚠ Adjunta el anverso del DNI.</div>}
          </div>
          <div>
            <div className={styles.label} style={{ marginBottom: 6 }}>Cara trasera (reverso)</div>
            <FileUpload
              label="Sube el reverso del DNI"
              file={formData.dniReverso}
              onFile={(f) => setDoc('dniReverso', f, 'dniReverso')}
              onRemove={() => setDoc('dniReverso', null, 'dniReverso')}
              required
              hasError={errors.includes('dniReverso')}
            />
            {errors.includes('dniReverso') && <div className={styles.errorMsg}>⚠ Adjunta el reverso del DNI.</div>}
          </div>
        </div>
      </div>

      {/* Borrador */}
      <div style={{ marginBottom: 24 }}>
        <div className={styles.label} style={{ marginBottom: 4 }}>Borrador de Hacienda (opcional pero recomendado)</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 12 }}>
          Si tienes acceso a la Sede Electrónica de la AEAT, descarga el borrador o la propuesta de declaración y adjúntalo aquí.
        </div>
        <FileUpload
          label="Subir borrador / propuesta de declaración"
          hint="PDF, JPG o PNG · Máx. 10 MB"
          file={formData.borradorHacienda}
          onFile={(f) => setDoc('borradorHacienda', f, 'borradorHacienda')}
          onRemove={() => setDoc('borradorHacienda', null, 'borradorHacienda')}
        />
      </div>

      {/* Lista de documentos condicional */}
      {docList.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: 4 }}>
            Documentación adicional necesaria
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 16 }}>
            Según los datos que has indicado, necesitamos los siguientes documentos. Marca cómo nos lo harás llegar:
          </div>
          <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0 16px' }}>
            {docList.map((item) => (
              <DocEntregaRow
                key={item.key}
                item={item}
                status={formData.documentosEntrega[item.key] ?? ''}
                onChange={(v) => setEntrega(item.key, v)}
              />
            ))}
          </div>
          <div className={styles.infoNote} style={{ marginTop: 12 }}>
            <span className={styles.infoNoteIcon}>ℹ️</span>
            <span>Si eliges "Por email / WhatsApp", envíalos a <strong>info@ecomsolutions.es</strong> o por WhatsApp indicando tu nombre. También puedes enviárnoslos una vez confirmemos tu cita.</span>
          </div>
        </div>
      )}

      {docList.length === 0 && (
        <div className={styles.infoNote}>
          <span className={styles.infoNoteIcon}>✅</span>
          <span>Con el DNI y el borrador es suficiente por ahora. Si necesitamos algún documento adicional te lo comunicaremos tras revisar tu declaración.</span>
        </div>
      )}
    </div>
  );
}
