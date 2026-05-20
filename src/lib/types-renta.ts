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
  nif: string;
  fechaNacimiento: string;
  discapacidad: boolean;
  porcentajeDiscapacidad: string;
  convive: boolean | null;
}

export interface AscendienteRenta {
  id: string;
  nombre: string;
  nif: string;
  parentesco: string;
  discapacidad: boolean;
  gradoDiscapacidad: string;
  conviveTodoElAnio: boolean | null;
}

export interface InmuebleRenta {
  id: string;
  referenciaCatastral: string;
  porcentajeTitularidad: string;
  uso: 'habitual' | 'alquilado' | 'vacio' | 'propio' | '';
  ingresosAlquiler: string;
  gastosAlquiler: string;
}

export interface GuarderiaRenta {
  nombreCentro: string;
  nifCentro: string;
  importe: string;
}

export type DocStatus = 'adjuntado' | 'email' | '';

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
  iban: string;
  claveCertificado: 'clave' | 'certificado' | 'referencia' | 'no' | '';

  // Paso 2 - Situación familiar
  tieneHijos: boolean | null;
  hijos: HijoRenta[];
  tieneAscendientes: boolean | null;
  ascendientes: AscendienteRenta[];
  tieneDiscapacidad: boolean | null;
  porcentajeDiscapacidad: string;
  esPensionistaViudedad: boolean | null;
  familiaNumerosa: boolean | null;
  categoriaNumerosa: 'general' | 'especial' | '';
  familiaMonoparental: boolean | null;

  // Paso 3 - Ingresos y retenciones
  tieneNominas: boolean | null;
  numeroPagadores: string;
  importeBrutoTotal: string;
  retencionesTotal: string;
  tieneRetribucionesEspecie: boolean | null;
  descripcionRetribucionesEspecie: string;
  tieneDietas: boolean | null;
  importeDietas: string;
  tieneDesempleo: boolean | null;
  importeDesempleo: string;
  tieneIncapacidadTemporal: boolean | null;
  importeIncapacidadTemporal: string;
  tieneMaternidadPaternidad: boolean | null;
  importeMaternidadPaternidad: string;
  tienePension: boolean | null;
  tipoPension: string;
  importePension: string;
  tieneAutonomo: boolean | null;
  regimenEstimacion: string;
  ingresosAutonomo: string;
  gastosAutonomo: string;
  cuotasSSAutonomo: string;
  tieneTrabajadoresAutonomo: boolean | null;
  usaVehiculoActividad: boolean | null;
  usaLocalActividad: boolean | null;
  tieneInmuebles: boolean | null;
  inmuebles: InmuebleRenta[];
  tieneCuentasExtranjero: boolean | null;
  tieneDividendosExtranjero: boolean | null;
  importeDividendosExtranjero: string;
  tieneCripto: boolean | null;
  descripcionCripto: string;
  tieneGanancias: boolean | null;
  descripcionGanancias: string;
  tienePerdidasAnteriores: boolean | null;
  importePerdidasAnteriores: string;
  tieneCapitalMobiliario: boolean | null;
  importeCapitalMobiliario: string;

  // Paso 4 - Deducciones
  viviendaHabitual2013: boolean | null;
  tienePlanPensiones: boolean | null;
  importePlanPensiones: string;
  tieneAportacionConyuge: boolean | null;
  importeAportacionConyuge: string;
  tienePPA: boolean | null;
  importePPA: string;
  tieneSeguroDependencia: boolean | null;
  importeSeguroDependencia: string;
  tienePensionCompensatoria: boolean | null;
  importePensionCompensatoria: string;
  tieneAnualidadesAlimentos: boolean | null;
  importeAnualidadesAlimentos: string;
  tieneDonativos: boolean | null;
  importeDonativos: string;
  alquilerAntes2015: boolean | null;
  clausulaSupelo: boolean | null;
  tieneHijosMenos3: boolean | null;
  cobroAbono140: boolean | null;
  tieneGuarderia: boolean | null;
  guarderia: GuarderiaRenta;
  tieneInversionNuevaEmpresa: boolean | null;
  importeInversionNuevaEmpresa: string;
  tieneRentasExtranjero: boolean | null;
  importeRentasExtranjero: string;
  deduccionesAutonomicas: string[];

  // Paso 5 - Otras situaciones
  residioFueraEspana: boolean | null;
  trabajoFueraEspana: boolean | null;
  fallecioFamiliar: boolean | null;
  recibioPRequerimiento: boolean | null;
  tieneBasesNegativas: boolean | null;
  importeBasesNegativas: string;
  tieneOperacionesVinculadas: boolean | null;
  otrasSituaciones: string;

  // Paso 6 - Documentación
  dniAnverso: FileAttachmentRenta | null;
  dniReverso: FileAttachmentRenta | null;
  borradorHacienda: FileAttachmentRenta | null;
  documentosEntrega: Record<string, DocStatus>;

  // Paso 7 - Resumen y envío
  ejercicioFiscal: string;
  privacidad: boolean;
}

export const ESTADOS_CIVILES_RENTA = [
  'Soltero/a',
  'Casado/a',
  'Pareja de hecho',
  'Divorciado/a',
  'Separado/a legalmente',
  'Viudo/a',
];

export const EJERCICIOS_FISCALES = ['2024', '2025'];

export const CLAVE_CERTIFICADO_OPTIONS = [
  { value: 'clave', label: 'Cl@ve PIN / Cl@ve permanente' },
  { value: 'certificado', label: 'Certificado electrónico' },
  { value: 'referencia', label: 'Número de referencia (RENØ)' },
  { value: 'no', label: 'No dispongo de ninguno' },
] as const;

export const DEDUCCIONES_AUTONOMICAS_OPTIONS = [
  { key: 'nacimiento_adopcion', label: 'Nacimiento o adopción de hijos' },
  { key: 'alquiler_vivienda', label: 'Alquiler vivienda habitual (autonómica)' },
  { key: 'gastos_educativos', label: 'Gastos educativos (libros, uniformes, comedores)' },
  { key: 'clases_extraescolares', label: 'Clases extraescolares de idiomas o informática' },
  { key: 'guarderia_0_3', label: 'Guardería 0–3 años (autonómica)' },
  { key: 'cuidado_ascendientes', label: 'Cuidado de ascendientes mayores de 65 años' },
  { key: 'familia_monoparental', label: 'Familia monoparental' },
  { key: 'discapacidad_asistencia', label: 'Discapacidad o necesidad de asistencia' },
  { key: 'vehiculo_electrico', label: 'Adquisición de vehículo eléctrico' },
  { key: 'donativos_autonomicos', label: 'Donativos a entidades de la comunidad autónoma' },
  { key: 'inversion_empresas_ccaa', label: 'Inversión en empresas de la CCAA' },
  { key: 'rehabilitacion_energetica', label: 'Rehabilitación / eficiencia energética' },
] as const;

export const PARENTESCO_OPTIONS = ['Padre / Madre', 'Abuelo/a', 'Bisabuelo/a', 'Otro'];

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
  iban: '',
  claveCertificado: '',

  tieneHijos: null,
  hijos: [],
  tieneAscendientes: null,
  ascendientes: [],
  tieneDiscapacidad: null,
  porcentajeDiscapacidad: '',
  esPensionistaViudedad: null,
  familiaNumerosa: null,
  categoriaNumerosa: '',
  familiaMonoparental: null,

  tieneNominas: null,
  numeroPagadores: '',
  importeBrutoTotal: '',
  retencionesTotal: '',
  tieneRetribucionesEspecie: null,
  descripcionRetribucionesEspecie: '',
  tieneDietas: null,
  importeDietas: '',
  tieneDesempleo: null,
  importeDesempleo: '',
  tieneIncapacidadTemporal: null,
  importeIncapacidadTemporal: '',
  tieneMaternidadPaternidad: null,
  importeMaternidadPaternidad: '',
  tienePension: null,
  tipoPension: '',
  importePension: '',
  tieneAutonomo: null,
  regimenEstimacion: '',
  ingresosAutonomo: '',
  gastosAutonomo: '',
  cuotasSSAutonomo: '',
  tieneTrabajadoresAutonomo: null,
  usaVehiculoActividad: null,
  usaLocalActividad: null,
  tieneInmuebles: null,
  inmuebles: [],
  tieneCuentasExtranjero: null,
  tieneDividendosExtranjero: null,
  importeDividendosExtranjero: '',
  tieneCripto: null,
  descripcionCripto: '',
  tieneGanancias: null,
  descripcionGanancias: '',
  tienePerdidasAnteriores: null,
  importePerdidasAnteriores: '',
  tieneCapitalMobiliario: null,
  importeCapitalMobiliario: '',

  viviendaHabitual2013: null,
  tienePlanPensiones: null,
  importePlanPensiones: '',
  tieneAportacionConyuge: null,
  importeAportacionConyuge: '',
  tienePPA: null,
  importePPA: '',
  tieneSeguroDependencia: null,
  importeSeguroDependencia: '',
  tienePensionCompensatoria: null,
  importePensionCompensatoria: '',
  tieneAnualidadesAlimentos: null,
  importeAnualidadesAlimentos: '',
  tieneDonativos: null,
  importeDonativos: '',
  alquilerAntes2015: null,
  clausulaSupelo: null,
  tieneHijosMenos3: null,
  cobroAbono140: null,
  tieneGuarderia: null,
  guarderia: { nombreCentro: '', nifCentro: '', importe: '' },
  tieneInversionNuevaEmpresa: null,
  importeInversionNuevaEmpresa: '',
  tieneRentasExtranjero: null,
  importeRentasExtranjero: '',
  deduccionesAutonomicas: [],

  residioFueraEspana: null,
  trabajoFueraEspana: null,
  fallecioFamiliar: null,
  recibioPRequerimiento: null,
  tieneBasesNegativas: null,
  importeBasesNegativas: '',
  tieneOperacionesVinculadas: null,
  otrasSituaciones: '',

  dniAnverso: null,
  dniReverso: null,
  borradorHacienda: null,
  documentosEntrega: {},

  ejercicioFiscal: '2024',
  privacidad: false,
};
