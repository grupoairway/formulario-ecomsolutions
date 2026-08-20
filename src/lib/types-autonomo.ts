export type TipoDocumentoAutonomo = 'dni' | 'nie_comunitario' | 'nie_extracomunitario' | '';

export interface DomicilioAutonomo {
  calle: string;
  numero: string;
  piso: string;
  cp: string;
  municipio: string;
  provincia: string;
}

export interface CentroActividadAutonomo {
  direccion: string;
  municipio: string;
  provincia: string;
  cp: string;
  m2: string;
}

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  data: string;
}

export interface AutonomoFormData {
  // Step 1 - Datos personales
  nombreCompleto: string;
  fechaNacimiento: string;
  nacionalidad: string;
  tipoDocumento: TipoDocumentoAutonomo;
  numeroDocumento: string;
  domicilio: DomicilioAutonomo;
  mismoCentroActividad: boolean | null;
  centroActividad: CentroActividadAutonomo;
  telefono: string;
  email: string;
  estadoCivil: string;
  fechaEstadoCivil: string;

  // Step 2 - Actividad
  descripcionActividad: string;
  fechaInicio: string;
  cuantoAntes: boolean;
  roi: boolean | null;

  // Step 3 - Seguridad Social
  numeroAfiliacionSS: string;
  mutua: string;
  iban: string;
  ingresosNetos: string;
  noAltaDosAnios: boolean;
  sinDeudasSS: boolean;

  // Step 4 - Documentación
  dniAnverso: FileAttachment | null;
  dniReverso: FileAttachment | null;
  permisoTrabajo: FileAttachment | null;

  // Step 5 - Resumen y envío
  privacidad: boolean;
}

export const initialAutonomoFormData: AutonomoFormData = {
  nombreCompleto: '',
  fechaNacimiento: '',
  nacionalidad: 'Española',
  tipoDocumento: '',
  numeroDocumento: '',
  domicilio: { calle: '', numero: '', piso: '', cp: '', municipio: '', provincia: '' },
  mismoCentroActividad: null,
  centroActividad: { direccion: '', municipio: '', provincia: '', cp: '', m2: '' },
  telefono: '',
  email: '',
  estadoCivil: '',
  fechaEstadoCivil: '',
  descripcionActividad: '',
  fechaInicio: '',
  cuantoAntes: false,
  roi: null,
  numeroAfiliacionSS: '',
  mutua: '',
  iban: '',
  ingresosNetos: '',
  noAltaDosAnios: false,
  sinDeudasSS: false,
  dniAnverso: null,
  dniReverso: null,
  permisoTrabajo: null,
  privacidad: false,
};

export const ESTADOS_CIVILES_AUTONOMO = [
  'Soltero/a',
  'Casado/a',
  'Pareja de hecho',
  'Divorciado/a',
  'Viudo/a',
];

export const ESTADOS_CON_FECHA = ['Casado/a', 'Pareja de hecho', 'Divorciado/a', 'Viudo/a'];
