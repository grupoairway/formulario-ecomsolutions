import { FileAttachment } from './types-autonomo';

/** Lado mayor al que se redimensionan las imágenes antes de subirlas. */
export const MAX_EDGE_PX = 1600;
/** Calidad del reencodeado JPEG. */
export const JPEG_QUALITY = 0.8;
/** Tope de entrada para imágenes: se comprimen después, así que puede ser generoso. */
export const MAX_IMAGE_INPUT_MB = 20;
/** Tope duro para PDF: no se pueden comprimir en el navegador. */
export const MAX_PDF_MB = 3;
/**
 * Presupuesto total del cuerpo de la petición.
 * Vercel corta las API routes en 4.500.000 bytes EXACTOS (medido en producción:
 * 4.400.000 pasa, 4.500.000 devuelve 413 FUNCTION_PAYLOAD_TOO_LARGE sin llegar
 * a invocar la función). Dejamos ~500 KB de margen para el resto del JSON.
 */
export const MAX_TOTAL_UPLOAD_BYTES = 4_000_000;

const COMPRESSIBLE = ['image/jpeg', 'image/png', 'image/webp'];

export function isCompressible(type: string): boolean {
  return COMPRESSIBLE.includes(type);
}

/** Lo que ocupará el adjunto en el JSON: la data-URL base64 ya codificada. */
export function attachmentBytes(file: FileAttachment | null): number {
  return file?.data?.length ?? 0;
}

export function totalUploadBytes(files: (FileAttachment | null)[]): number {
  return files.reduce((sum, f) => sum + attachmentBytes(f), 0);
}

export function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(blob);
  });
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    // 'from-image' respeta la orientación EXIF. Sin esto, las fotos hechas en
    // vertical con el móvil se guardan giradas 90º.
    return createImageBitmap(file, { imageOrientation: 'from-image' });
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Redimensiona a MAX_EDGE_PX de lado mayor y reencodea a JPEG.
 * Una foto de DNI de 12 MP (~4 MB) queda en 200-500 KB, legible de sobra:
 * 1600 px sobre una tarjeta de 8,5 cm son ~475 ppp.
 * Si el reencodeado no gana tamaño, se conserva el original.
 */
export async function compressImage(
  file: File,
): Promise<{ dataUrl: string; size: number; name: string; type: string }> {
  const bitmap = await loadImage(file);
  const width = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width;
  const height = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height;

  const scale = Math.min(1, MAX_EDGE_PX / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');
  // Fondo blanco: un PNG con transparencia saldría con fondo negro en JPEG.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  if ('close' in bitmap) bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );

  if (!blob || blob.size >= file.size) {
    return {
      dataUrl: await readAsDataUrl(file),
      size: file.size,
      name: file.name,
      type: file.type,
    };
  }

  return {
    dataUrl: await readAsDataUrl(blob),
    size: blob.size,
    name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
    type: 'image/jpeg',
  };
}
