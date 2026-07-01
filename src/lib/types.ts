export type MetodoDenominacion = 'nuevo' | 'bolsa' | 'certificado';
export type TipoPersona = 'sr' | 'sra' | 'sociedad';
export type TipoAportacion =
  | 'dineraria_acreditada'
  | 'no_dineraria'
  | 'dineraria_no_acreditada';
export type TipoRetribucion = 'fija' | 'porcentual';
export type TipoAdministracion = 'solidarios' | 'mancomunados';
export type Sexo = 'hombre' | 'mujer' | '';
export type DuracionSociedad = 'indefinida' | 'determinada';

// Dirección desglosada (reutilizable: domicilio social, centro de actividad, socios)
export interface DireccionDetallada {
  tipoVia: string;
  nombreVia: string;
  numero: string;
  bloque: string;
  piso: string;
  puerta: string;
  codigoPostal: string;
  municipio: string;
  provincia: string;
}

// Local con dirección + datos de superficie (domicilio social / centro de actividad)
export interface DomicilioFields {
  direccion: DireccionDetallada;
  superficie: string;
  porcentajeActividad: string;
}

export interface Socio {
  id: string;
  tipo: TipoPersona;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  sexo: Sexo; // solo persona física
  documento: string;
  email: string;
  fechaNacimientoConstitucion: string; // nacimiento (física) o constitución (jurídica)
  fechaInscripcion: string; // solo persona jurídica: inscripción registral
  nacionalidad: string;
  estadoCivil: string;
  // Representante (solo cuando el socio es persona jurídica)
  representanteNombre: string;
  representanteApellidos: string;
  representanteDocumento: string;
  mismoDomicilio: boolean;
  direccion: DireccionDetallada; // domicilio propio del socio (si no coincide con el social)
  tipoAportacion: TipoAportacion | '';
  importeAportacion: string; // importe/valoración en € (para todas las aportaciones)
  descripcionBienes: string; // solo aportación no dineraria: descripción de bienes
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
  // Step 1 — Denominación
  metodoDenominacion: MetodoDenominacion | '';
  denominaciones: [string, string, string, string, string];
  nombreBolsa: string;
  denominacionCertificada: string;

  // Step 2 — Empresa / actividad
  actividadPrincipal: string;
  actividadesSecundarias: string[];
  roi: boolean | null;
  fechaInicioActividad: string;
  cierreEjercicio: string; // default '31/12'
  duracionSociedad: DuracionSociedad; // default 'indefinida'
  duracionAnios: string; // solo si duracionSociedad === 'determinada'

  // Step 3 — Domicilio social
  domicilio: DomicilioFields;

  // Step 4 — Centro de actividad
  mismoCentroActividad: boolean | null;
  centroActividad: DomicilioFields;

  // Step 5 — Socios
  socios: Socio[];
  capitalSocial: string; // campo propio (validado contra la suma de aportaciones)

  // Step 6 — Administradores
  tipoAdministracion: TipoAdministracion | '';
  administradores: Administrador[];

  // Step 7 — Confirmación
  confirmacion: boolean;
}

export function createEmptyDireccion(): DireccionDetallada {
  return {
    tipoVia: 'Calle',
    nombreVia: '',
    numero: '',
    bloque: '',
    piso: '',
    puerta: '',
    codigoPostal: '',
    municipio: '',
    provincia: '',
  };
}

export function createEmptyDomicilio(): DomicilioFields {
  return {
    direccion: createEmptyDireccion(),
    superficie: '',
    porcentajeActividad: '',
  };
}

export function createEmptySocio(): Socio {
  return {
    id: Math.random().toString(36).slice(2),
    tipo: 'sr',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    sexo: '',
    documento: '',
    email: '',
    fechaNacimientoConstitucion: '',
    fechaInscripcion: '',
    nacionalidad: 'Española',
    estadoCivil: '',
    representanteNombre: '',
    representanteApellidos: '',
    representanteDocumento: '',
    mismoDomicilio: true,
    direccion: createEmptyDireccion(),
    tipoAportacion: '',
    importeAportacion: '',
    descripcionBienes: '',
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

export const TIPOS_VIA = [
  'Calle',
  'Avenida',
  'Plaza',
  'Paseo',
  'Camino',
  'Carretera',
  'Ronda',
  'Travesía',
  'Vía',
  'Rambla',
  'Callejón',
  'Polígono',
  'Urbanización',
  'Otro',
];

export const SEXOS: { value: Sexo; label: string }[] = [
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer', label: 'Mujer' },
];

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
  actividadPrincipal: '',
  actividadesSecundarias: [],
  roi: null,
  fechaInicioActividad: '',
  cierreEjercicio: '31/12',
  duracionSociedad: 'indefinida',
  duracionAnios: '',
  domicilio: createEmptyDomicilio(),
  mismoCentroActividad: null,
  centroActividad: createEmptyDomicilio(),
  socios: [],
  capitalSocial: '',
  tipoAdministracion: '',
  administradores: [],
  confirmacion: false,
};
