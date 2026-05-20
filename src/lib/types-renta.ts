export interface FileAttachmentRenta {
  name: string;
  size: number;
  type: string;
  data: string;
}

export interface DomicilioRenta {
  calle: string;
  numero: string;
  piso: string;
  cp: string;
  municipio: string;
  provincia: string;
}

export interface ConyugeRenta {
  nombre: string;
  nif: string;
}

export interface HijoRenta {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  discapacidad: boolean;
  porcentajeDiscapacidad: string;
}

export interface AscendienteRenta {
  id: string;
  nombre: string;
  nif: string;
  discapacidad: boolean;
  gradoDiscapacidad: string;
}

export interface RentaFormData {
  // Paso 1 - Datos personales
  nombreCompleto: string;
  nif: string;
  fechaNacimiento: string;
  estadoCivil: string;
  declaracionTipo: 'individual' | 'conjunta' | '';
  conyuge: ConyugeRenta;
  domicilio: DomicilioRenta;
  telefono: string;
  email: string;
  cambioDomicilio: boolean | null;

  // Paso 2 - Situación familiar
  tieneHijos: boolean | null;
  hijos: HijoRenta[];
  tieneAscendientes: boolean | null;
  ascendientes: AscendienteRenta[];
  tieneDiscapacidad: boolean | null;
  porcentajeDiscapacidad: string;
  esPensionistaViudedad: boolean | null;

  // Paso 3 - Ingresos y retenciones
  tieneNominas: boolean | null;
  numeroPagadores: string;
  importeBrutoTotal: string;
  retencionesTotal: string;
  tieneDesempleo: boolean | null;
  importeDesempleo: string;
  tienePension: boolean | null;
  tipoPension: string;
  importePension: string;
  tieneAutonomo: boolean | null;
  regimenEstimacion: string;
  ingresosAutonomo: string;
  gastosAutonomo: string;
  tieneAlquiler: boolean | null;
  ingresosAlquiler: string;
  gastosAlquiler: string;
  tieneGanancias: boolean | null;
  descripcionGanancias: string;
  tieneCapitalMobiliario: boolean | null;
  importeCapitalMobiliario: string;

  // Paso 4 - Deducciones
  viviendaHabitual2013: boolean | null;
  tienePlanPensiones: boolean | null;
  importePlanPensiones: string;
  tieneDonativos: boolean | null;
  importeDonativos: string;
  alquilerAntes2015: boolean | null;
  clausulaSupelo: boolean | null;

  // Paso 5 - Documentación
  dniAnverso: FileAttachmentRenta | null;
  dniReverso: FileAttachmentRenta | null;
  borradorHacienda: FileAttachmentRenta | null;
  certificadoRetencion1: FileAttachmentRenta | null;
  certificadoRetencion2: FileAttachmentRenta | null;
  certificadoRetencion3: FileAttachmentRenta | null;

  // Paso 6 - Resumen y envío
  ejercicioFiscal: string;
  privacidad: boolean;
}

export const ESTADOS_CIVILES_RENTA = [
  'Soltero/a',
  'Casado/a',
  'Pareja de hecho',
  'Divorciado/a',
  'Viudo/a',
];

export const EJERCICIOS_FISCALES = ['2024', '2025'];

export const initialRentaFormData: RentaFormData = {
  nombreCompleto: '',
  nif: '',
  fechaNacimiento: '',
  estadoCivil: '',
  declaracionTipo: '',
  conyuge: { nombre: '', nif: '' },
  domicilio: { calle: '', numero: '', piso: '', cp: '', municipio: '', provincia: '' },
  telefono: '',
  email: '',
  cambioDomicilio: null,

  tieneHijos: null,
  hijos: [],
  tieneAscendientes: null,
  ascendientes: [],
  tieneDiscapacidad: null,
  porcentajeDiscapacidad: '',
  esPensionistaViudedad: null,

  tieneNominas: null,
  numeroPagadores: '',
  importeBrutoTotal: '',
  retencionesTotal: '',
  tieneDesempleo: null,
  importeDesempleo: '',
  tienePension: null,
  tipoPension: '',
  importePension: '',
  tieneAutonomo: null,
  regimenEstimacion: '',
  ingresosAutonomo: '',
  gastosAutonomo: '',
  tieneAlquiler: null,
  ingresosAlquiler: '',
  gastosAlquiler: '',
  tieneGanancias: null,
  descripcionGanancias: '',
  tieneCapitalMobiliario: null,
  importeCapitalMobiliario: '',

  viviendaHabitual2013: null,
  tienePlanPensiones: null,
  importePlanPensiones: '',
  tieneDonativos: null,
  importeDonativos: '',
  alquilerAntes2015: null,
  clausulaSupelo: null,

  dniAnverso: null,
  dniReverso: null,
  borradorHacienda: null,
  certificadoRetencion1: null,
  certificadoRetencion2: null,
  certificadoRetencion3: null,

  ejercicioFiscal: '2024',
  privacidad: false,
};
