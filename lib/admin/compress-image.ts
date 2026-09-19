export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const MAX_SIDE = 1600;
const QUALITY = 0.82;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/**
 * Reduce la imagen a un máximo de 1600 px por lado y la convierte a WebP antes
 * de subirla: una foto de celular de 6 MB queda en unos 200 KB y la tienda
 * carga más rápido. Si el navegador no puede generar WebP, usa JPEG.
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Solo se aceptan imágenes JPG, PNG, WebP o AVIF.");
  }
  if (file.size > MAX_INPUT_BYTES) throw new Error("La imagen pesa más de 15 MB.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Tu navegador no pudo procesar la imagen.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await canvasToBlob(canvas, "image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await canvasToBlob(canvas, "image/jpeg");
  if (jpeg) return jpeg;
  throw new Error("No pudimos comprimir la imagen.");
}
