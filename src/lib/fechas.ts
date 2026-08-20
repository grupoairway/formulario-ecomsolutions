/**
 * Validación de fechas para los formularios.
 *
 * El caso que motivó esto: un año de 5 cifras ("12121-12-10") tecleado en el
 * móvil llegó tal cual a Notion, que rechazó la propiedad `date` y tumbó la
 * escritura entera. Un `<input type="date">` NO garantiza un año de 4 cifras:
 * varios navegadores móviles dejan escribirlo a mano.
 */

function iso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Hoy en YYYY-MM-DD (hora local). */
export function hoyISO(): string {
  return iso(new Date());
}

/** Hoy desplazado N días (negativo = pasado), en YYYY-MM-DD. */
export function hoyMasDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return iso(d);
}

/** Hoy desplazado N años hacia atrás, en YYYY-MM-DD. */
export function hoyMenosAnios(anios: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - anios);
  return iso(d);
}

/**
 * true solo si es YYYY-MM-DD con año de 4 cifras Y una fecha que existe.
 * El round-trip por Date caza lo que el regex no ve: 2025-02-31, 2025-13-01.
 */
export function esFechaValida(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [a, m, d] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(a, m - 1, d));
  return (
    fecha.getUTCFullYear() === a && fecha.getUTCMonth() === m - 1 && fecha.getUTCDate() === d
  );
}

export type ErrorFecha = 'formato' | 'menor' | 'antigua' | 'futura' | 'rango';

export const EDAD_MINIMA = 18;
export const EDAD_MAXIMA = 100;

/** Límites para el atributo min/max de un input de fecha de nacimiento. */
export const minNacimiento = () => hoyMenosAnios(EDAD_MAXIMA);
export const maxNacimiento = () => hoyMenosAnios(EDAD_MINIMA);

/** Nacimiento del titular: año de 4 cifras, fecha real, mayor de edad, < 100 años. */
export function validarNacimiento(valor: string): ErrorFecha | null {
  if (!esFechaValida(valor)) return 'formato';
  if (valor > maxNacimiento()) return 'menor';
  if (valor < minNacimiento()) return 'antigua';
  return null;
}

/** Fecha pasada razonable: ni futura ni de hace más de `aniosAtras` años. */
export function validarNoFutura(valor: string, aniosAtras = EDAD_MAXIMA): ErrorFecha | null {
  if (!esFechaValida(valor)) return 'formato';
  if (valor > hoyISO()) return 'futura';
  if (valor < hoyMenosAnios(aniosAtras)) return 'antigua';
  return null;
}

/**
 * Alta de actividad. El alta en el RETA se tramita con hasta 60 días de
 * antelación; más allá es una errata. Hacia atrás se admite un margen corto
 * para altas que se regularizan con algún día de retraso.
 */
export const INICIO_DIAS_ATRAS = 30;
export const INICIO_DIAS_ADELANTE = 60;
export const minInicioActividad = () => hoyMasDias(-INICIO_DIAS_ATRAS);
export const maxInicioActividad = () => hoyMasDias(INICIO_DIAS_ADELANTE);

export function validarInicioActividad(valor: string): ErrorFecha | null {
  if (!esFechaValida(valor)) return 'formato';
  if (valor < minInicioActividad() || valor > maxInicioActividad()) return 'rango';
  return null;
}

/** Validación genérica contra un rango explícito. */
export function validarEnRango(valor: string, min: string, max: string): ErrorFecha | null {
  if (!esFechaValida(valor)) return 'formato';
  if (valor < min || valor > max) return 'rango';
  return null;
}

/**
 * Saneador de servidor. Devuelve la fecha si es utilizable, o null.
 * Nunca lanza: su trabajo es justamente que una fecha mal formada no pueda
 * reventar la escritura en Notion.
 */
export function fechaParaNotion(valor: unknown): string | null {
  return esFechaValida(valor) ? valor : null;
}
