/** Quita espacios y guiones y pasa a mayúsculas. */
export function normalizarIban(valor: string): string {
  return (valor || '').replace(/[\s-]/g, '').toUpperCase();
}

export type ErrorIban = 'formato' | 'digitoControl';

/**
 * IBAN español: ES + 2 dígitos de control + 20 dígitos = 24 caracteres.
 *
 * Además del formato se comprueba el dígito de control (mod 97 del IBAN
 * reordenado, ISO 13616). Sin esa comprobación, "ES00 0000 0000 0000 0000 0000"
 * pasaría por bueno: el formato solo cuenta cifras, y lo que provoca un recibo
 * devuelto son dos dígitos intercambiados, que el mod 97 sí detecta.
 */
export function validarIbanEspanol(valor: string): ErrorIban | null {
  const iban = normalizarIban(valor);
  if (!/^ES\d{22}$/.test(iban)) return 'formato';

  // Los 4 primeros caracteres pasan al final y las letras se sustituyen por
  // su posición en el alfabeto + 9 (A=10 … Z=35).
  const reordenado = iban.slice(4) + iban.slice(0, 4);
  const numerico = reordenado.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));

  // Mod 97 dígito a dígito: el número completo excede Number.MAX_SAFE_INTEGER.
  let resto = 0;
  for (const ch of numerico) resto = (resto * 10 + Number(ch)) % 97;

  return resto === 1 ? null : 'digitoControl';
}

/** Formato legible en grupos de 4: ES91 2100 0418 4502 0005 1332. */
export function formatearIban(valor: string): string {
  return normalizarIban(valor).replace(/(.{4})/g, '$1 ').trim();
}
