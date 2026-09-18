/** Minúsculas y sin acentos, para comparar textos en español. */
export function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export const CONDITION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open box",
  usado: "Usado",
  reacondicionado: "Reacondicionado",
} as const;

export const SORT_LABELS = {
  relevancia: "Relevancia",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  nuevos: "Más nuevos",
} as const;
