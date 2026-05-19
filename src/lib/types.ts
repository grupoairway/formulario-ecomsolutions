export type MetodoDenominacion = 'nuevo' | 'bolsa' | 'certificado';
export type TipoPersona = 'sr' | 'sra' | 'sociedad';
export type TipoAportacion =
  | 'dineraria_acreditada'
  | 'no_dineraria'
  | 'dineraria_no_acreditada';
export type TipoRetribucion = 'fija' | 'porcentual';
export type TipoAdministracion = 'solidarios' | 'mancomunados';

export interface DomicilioFields {
  provincia: string;
  municipio: string;
  codigoPostal: string;
  direccion: string;
  superficie: string;
  porcentajeActividad: string;
}

export interface Socio {
  id: string;
  tipo: TipoPersona;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  documento: string;
  email: string;
  fechaNacimientoConstitucion: string;
  nacionalidad: string;
  estadoCivil: string;
  mismoDomicilio: boolean;
  direccionAlternativa: string;
  tipoAportacion: TipoAportacion | '';
  aportacion: string;
}

export interface Administrador {
  id: string;
  tipo: 'persona' | 'sociedad';
  nombre: string;
  apellidos: string;
  documento: string;
  representanteNombre: string;
  representanteApellidos: string;
  representanteDocumento: string;
  cobranRetribucion: boolean | null;
  tipoRetribucion: TipoRetribucion | null;
  porcentajeRetribucion: string;
  esAutonomoSocietario: boolean | null;
  numeroAfiliacionSS: string;
  mutua: string;
  iban: string;
  tarifaReducida: boolean | null;
}

export interface FormData {
  // Step 1
  metodoDenominacion: MetodoDenominacion | '';
  denominaciones: [string, string, string, string, string];
  nombreBolsa: string;
  denominacionCertificada: string;

  // Step 2
  actividad: string;
  roi: boolean | null;
  fechaInicioActividad: string;

  // Step 3
  domicilio: DomicilioFields;

  // Step 4
  mismoCentroActividad: boolean | null;
  centroActividad: DomicilioFields;

  // Step 5
  socios: Socio[];

  // Step 6
  tipoAdministracion: TipoAdministracion | '';
  administradores: Administrador[];

  // Step 7
  confirmacion: boolean;
}

export function createEmptySocio(): Socio {
  return {
    id: Math.random().toString(36).slice(2),
    tipo: 'sr',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    documento: '',
    email: '',
    fechaNacimientoConstitucion: '',
    nacionalidad: 'Española',
    estadoCivil: '',
    mismoDomicilio: true,
    direccionAlternativa: '',
    tipoAportacion: '',
    aportacion: '',
  };
}

export function createEmptyAdministrador(): Administrador {
  return {
    id: Math.random().toString(36).slice(2),
    tipo: 'persona',
    nombre: '',
    apellidos: '',
    documento: '',
    representanteNombre: '',
    representanteApellidos: '',
    representanteDocumento: '',
    cobranRetribucion: null,
    tipoRetribucion: null,
    porcentajeRetribucion: '',
    esAutonomoSocietario: null,
    numeroAfiliacionSS: '',
    mutua: '',
    iban: '',
    tarifaReducida: null,
  };
}

export const PROVINCIAS = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
  'Badajoz', 'Islas Baleares', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz',
  'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Girona', 'Granada', 'Guadalajara', 'Gipuzkoa', 'Huelva', 'Huesca',
  'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid',
  'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
  'Pontevedra', 'La Coruña', 'Salamanca', 'Santa Cruz de Tenerife',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza',
];

export const MUTUAS = [
  'Asepeyo',
  'Activa Mutua 2008',
  'Cyclops',
  'Egarsat',
  'FREMAP',
  'Fraternidad-Muprespa',
  'Ibermutuamur',
  'MAC Mutual',
  'MACC (Mutua de Accidentes de Canarias)',
  'MC Mutual',
  'Mutua Balear',
  'Mutua Intercomarcal',
  'Mutua Navarra',
  'Mutua Universal',
  'Mutualia',
  'Solimat',
  'Umivale Activa',
  'Unión de Mutuas',
];

export const ESTADOS_CIVILES = [
  'Casado/a',
  'Divorciado/a',
  'Pareja de hecho',
  'Separado/a',
  'Soltero/a',
  'Viudo/a',
];

export const initialFormData: FormData = {
  metodoDenominacion: '',
  denominaciones: ['', '', '', '', ''],
  nombreBolsa: '',
  denominacionCertificada: '',
  actividad: '',
  roi: null,
  fechaInicioActividad: '',
  domicilio: {
    provincia: '',
    municipio: '',
    codigoPostal: '',
    direccion: '',
    superficie: '',
    porcentajeActividad: '',
  },
  mismoCentroActividad: null,
  centroActividad: {
    provincia: '',
    municipio: '',
    codigoPostal: '',
    direccion: '',
    superficie: '',
    porcentajeActividad: '',
  },
  socios: [],
  tipoAdministracion: '',
  administradores: [],
  confirmacion: false,
};
