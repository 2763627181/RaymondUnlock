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

/** Tipo de liberación del equipo. "Por artista" es como se le llama en RD al desbloqueo hecho por un técnico. */
export const UNLOCK_LABELS = {
  factory: "Factory",
  artista: "Por artista",
} as const;

export function isUnlockType(value: string): value is keyof typeof UNLOCK_LABELS {
  return value === "factory" || value === "artista";
}

export const UNLOCK_HINTS = {
  factory: "Liberado de fábrica",
  artista: "Liberado por un técnico",
} as const;

export function formatBattery(percent: number): string {
  return `${percent} %`;
}

export const SORT_LABELS = {
  relevancia: "Relevancia",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  nuevos: "Más nuevos",
} as const;
