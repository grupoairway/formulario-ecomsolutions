'use client';

import { useState } from 'react';
import { FormData, DireccionDetallada } from '@/lib/types';
import styles from './steps.module.css';

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.resumenSection}>
      <div className={styles.resumenHeader} onClick={() => setOpen(!open)}>
        <span className={styles.resumenHeaderTitle}>{title}</span>
        <span className={`${styles.resumenChevron} ${open ? styles.resumenChevronOpen : ''}`}>
          ▼
        </span>
      </div>
      {open && <div className={styles.resumenBody}>{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined | null | boolean }) {
  if (value === undefined || value === null || value === '') return null;
  const display =
    typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value;
  return (
    <div className={styles.resumenRow}>
      <span className={styles.resumenKey}>{label}</span>
      <span className={styles.resumenVal}>{display}</span>
    </div>
  );
}

function parseNum(s: string): number {
  const n = parseFloat((s || '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function euros(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
}

function fmtDir(d: DireccionDetallada): string {
  const via = [d.tipoVia, d.nombreVia, d.numero].filter(Boolean).join(' ');
  const detalle = [
    d.bloque ? `Bloque ${d.bloque}` : '',
    d.piso ? `Piso ${d.piso}` : '',
    d.puerta ? `Puerta ${d.puerta}` : '',
  ]
    .filter(Boolean)
    .join(', ');
  const cpMun = [d.codigoPostal, d.municipio].filter(Boolean).join(' ');
  return [via, detalle, cpMun, d.provincia].filter(Boolean).join(', ');
}

const METODO_LABEL: Record<string, string> = {
  nuevo: 'Nombre nuevo',
  bolsa: 'Bolsa del Registro Mercantil',
  certificado: 'Certificado de denominación',
};

const APORTACION_LABEL: Record<string, string> = {
  dineraria_acreditada: 'Dineraria acreditada',
  no_dineraria: 'No dineraria',
  dineraria_no_acreditada: 'Dineraria no acreditada',
};

export default function Step07Resumen({ formData, onChange, errors }: Props) {
  const capital = parseNum(formData.capitalSocial);
  const totalAport = formData.socios.reduce((sum, s) => sum + parseNum(s.importeAportacion), 0);
  const cuadra = capital > 0 && Math.abs(totalAport - capital) < 0.005;

  const duracion = formData.duracionSociedad === 'determinada'
    ? `Determinada${formData.duracionAnios ? ` (${formData.duracionAnios} años)` : ''}`
    : 'Indefinida';
  const secundarias = formData.actividadesSecundarias.filter(Boolean);

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Revisa todos los datos antes de enviar. Si necesitas corregir algo, usa el botón
        &ldquo;Anterior&rdquo; para volver al paso correspondiente.
      </p>

      {/* Denominación */}
      <Section title="1. Denominación social">
        <Row label="Método" value={METODO_LABEL[formData.metodoDenominacion] ?? formData.metodoDenominacion} />
        {formData.metodoDenominacion === 'nuevo' &&
          formData.denominaciones
            .filter(Boolean)
            .map((d, i) => <Row key={i} label={`Opción ${i + 1}`} value={d} />)}
        {formData.metodoDenominacion === 'bolsa' && (
          <Row label="Nombre de la bolsa" value={formData.nombreBolsa} />
        )}
        {formData.metodoDenominacion === 'certificado' && (
          <Row label="Denominación certificada" value={formData.denominacionCertificada} />
        )}
      </Section>

      {/* Empresa */}
      <Section title="2. Información de la empresa">
        <Row label="Actividad principal" value={formData.actividadPrincipal} />
        {secundarias.length > 0 && (
          <Row label="Actividades secundarias" value={secundarias.join(', ')} />
        )}
        <Row label="ROI intracomunitario" value={formData.roi} />
        <Row label="Cierre de ejercicio" value={formData.cierreEjercicio} />
        <Row label="Duración" value={duracion} />
        {formData.fechaInicioActividad && (
          <Row label="Inicio de actividad" value={formData.fechaInicioActividad} />
        )}
      </Section>

      {/* Domicilio */}
      <Section title="3. Domicilio social">
        <Row label="Dirección" value={fmtDir(formData.domicilio.direccion)} />
        <Row label="Superficie" value={formData.domicilio.superficie ? `${formData.domicilio.superficie} m²` : ''} />
        <Row label="% actividad" value={formData.domicilio.porcentajeActividad ? `${formData.domicilio.porcentajeActividad}%` : ''} />
      </Section>

      {/* Centro actividad */}
      <Section title="4. Centro de actividad">
        <Row
          label="¿Mismo que domicilio?"
          value={formData.mismoCentroActividad === null ? '—' : formData.mismoCentroActividad}
        />
        {formData.mismoCentroActividad === false && (
          <>
            <Row label="Dirección" value={fmtDir(formData.centroActividad.direccion)} />
            <Row label="Superficie" value={formData.centroActividad.superficie ? `${formData.centroActividad.superficie} m²` : ''} />
            <Row label="% actividad" value={formData.centroActividad.porcentajeActividad ? `${formData.centroActividad.porcentajeActividad}%` : ''} />
          </>
        )}
      </Section>

      {/* Socios */}
      <Section title="5. Socios">
        {formData.socios.map((s, i) => {
          const esFisica = s.tipo !== 'sociedad';
          return (
            <div key={s.id} style={{ marginBottom: i < formData.socios.length - 1 ? 16 : 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: 'var(--color-text)' }}>
                Socio {i + 1} · {esFisica ? 'Persona física' : 'Persona jurídica'}
              </div>
              <Row
                label={esFisica ? 'Nombre' : 'Denominación'}
                value={
                  esFisica
                    ? [s.nombre, s.primerApellido, s.segundoApellido].filter(Boolean).join(' ')
                    : s.nombre
                }
              />
              <Row label={esFisica ? 'DNI/NIF/NIE' : 'CIF'} value={s.documento} />
              {esFisica && <Row label="Sexo" value={s.sexo === 'hombre' ? 'Hombre' : s.sexo === 'mujer' ? 'Mujer' : ''} />}
              <Row label="Nacionalidad" value={s.nacionalidad} />
              <Row label={esFisica ? 'Fecha nacimiento' : 'Fecha constitución'} value={s.fechaNacimientoConstitucion} />
              {esFisica && <Row label="Estado civil" value={s.estadoCivil} />}
              {!esFisica && <Row label="Fecha inscripción" value={s.fechaInscripcion} />}
              {!esFisica && (
                <Row
                  label="Representante"
                  value={[s.representanteNombre, s.representanteApellidos].filter(Boolean).join(' ')}
                />
              )}
              {!esFisica && <Row label="Doc. representante" value={s.representanteDocumento} />}
              {esFisica && <Row label="Email" value={s.email} />}
              <Row label="Domicilio" value={s.mismoDomicilio ? 'Mismo que el social' : fmtDir(s.direccion)} />
              <Row label="Aportación" value={APORTACION_LABEL[s.tipoAportacion] ?? ''} />
              <Row
                label="Importe / valoración"
                value={s.importeAportacion ? euros(parseNum(s.importeAportacion)) : ''}
              />
              {s.tipoAportacion === 'no_dineraria' && (
                <Row label="Bienes aportados" value={s.descripcionBienes} />
              )}
            </div>
          );
        })}
        <div style={{ marginTop: 12, padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
          <Row label="Capital social" value={capital > 0 ? euros(capital) : ''} />
          <Row label="Total aportado" value={euros(totalAport)} />
        </div>
        {capital > 0 && !cuadra && (
          <div className={styles.errorMsg} style={{ marginTop: 8 }}>
            ⚠ El total aportado ({euros(totalAport)}) no coincide con el capital social ({euros(capital)}).
            Puedes enviarlo igualmente; lo revisaremos.
          </div>
        )}
      </Section>

      {/* Administradores */}
      <Section title="6. Administradores">
        <Row label="Tipo administración" value={formData.tipoAdministracion} />
        {formData.administradores.map((a, i) => (
          <div key={a.id} style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: 'var(--color-text)' }}>
              Administrador {i + 1} · {a.tipo === 'sociedad' ? 'Persona jurídica' : 'Persona física'}
            </div>
            <Row
              label="Nombre"
              value={[a.nombre, a.apellidos].filter(Boolean).join(' ')}
            />
            <Row label="Documento" value={a.documento} />
            {a.tipo === 'sociedad' && (
              <Row
                label="Representante"
                value={[a.representanteNombre, a.representanteApellidos].filter(Boolean).join(' ')}
              />
            )}
            <Row label="Retribución" value={a.cobranRetribucion} />
            {a.cobranRetribucion && a.tipoRetribucion && (
              <Row
                label="Tipo retribución"
                value={
                  a.tipoRetribucion === 'porcentual' && a.porcentajeRetribucion
                    ? `Porcentual (${a.porcentajeRetribucion}%)`
                    : 'Fija'
                }
              />
            )}
            <Row label="Autónomo societario" value={a.esAutonomoSocietario} />
            {a.esAutonomoSocietario && <Row label="Mutua" value={a.mutua} />}
            {a.esAutonomoSocietario && <Row label="IBAN" value={a.iban} />}
            {a.esAutonomoSocietario && a.tarifaReducida !== null && (
              <Row label="Tarifa reducida" value={a.tarifaReducida} />
            )}
          </div>
        ))}
      </Section>

      {/* Confirmación */}
      <div
        className={`${styles.checkboxRow} ${formData.confirmacion ? styles.checked : ''}`}
        onClick={() => onChange({ confirmacion: !formData.confirmacion })}
      >
        <div className={styles.checkbox}>{formData.confirmacion && '✓'}</div>
        <span className={styles.checkboxLabel}>
          Confirmo que los datos son correctos y autorizo a EcomSolutions a tramitar la
          constitución de la Sociedad Limitada.
        </span>
      </div>
      {errors.includes('confirmacion') && (
        <div className={styles.errorMsg}>⚠ Debes confirmar los datos antes de enviar.</div>
      )}

      <div className={styles.infoNote}>
        <span className={styles.infoNoteIcon}>🔒</span>
        Tus datos se tratan de forma confidencial conforme al RGPD y solo se usarán para
        gestionar la constitución de tu sociedad.
      </div>
    </div>
  );
}
