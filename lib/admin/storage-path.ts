const PUBLIC_MARKER = "/storage/v1/object/public/products/";

/**
 * Ruta dentro del bucket "products" a partir de su URL pública, o null si la
 * URL no es de nuestro Storage (p. ej. una imagen de ejemplo en /seed/).
 */
export function storagePathFromUrl(url: string): string | null {
  const index = url.indexOf(PUBLIC_MARKER);
  if (index === -1) return null;
  const path = decodeURIComponent(url.slice(index + PUBLIC_MARKER.length).split("?")[0] ?? "");
  return path !== "" && !path.includes("..") ? path : null;
}
