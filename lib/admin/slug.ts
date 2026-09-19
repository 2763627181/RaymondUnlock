/**
 * Slug para URLs: minúsculas, sin acentos, palabras unidas con guion. Cumple la
 * restricción de la base (`^[a-z0-9]+(-[a-z0-9]+)*$`) o devuelve "" si no queda nada.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
