import { z } from "zod";
import { variantLabel } from "@/lib/catalog/cards";
import { CONDITION_LABELS, UNLOCK_LABELS, formatBattery } from "@/lib/catalog/text";
import { formatMoney } from "@/lib/format";
import type { Json } from "@/types/database";

/** Fila de product_history tal como la devuelve la base (solo la lee el admin). */
export interface HistoryRow {
  id: number;
  entity: string;
  action: string;
  old_data: Json | null;
  new_data: Json | null;
  changed_at: string;
}

export interface HistoryChange {
  label: string;
  before: string;
  after: string;
}

export interface HistoryEntry {
  id: number;
  at: string;
  action: "create" | "update" | "delete";
  title: string;
  /** Para las modificaciones: qué campos cambiaron y de qué a qué. */
  changes: HistoryChange[];
}

/** Nombres para mostrar ids de categoría y marca en vez del UUID. */
export interface HistoryLookups {
  categories: ReadonlyMap<string, string>;
  brands: ReadonlyMap<string, string>;
}

const record = z.record(z.string(), z.unknown());

/** Datos que la base mueve sola o que solo son de orden: nunca son "un cambio". */
const IGNORED = new Set(["id", "product_id", "created_at", "updated_at", "sort_order"]);

const EMPTY = "—";

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  slug: "Enlace (slug)",
  short_description: "Descripción corta",
  description: "Descripción",
  category_id: "Categoría",
  brand_id: "Marca",
  condition: "Estado",
  specs: "Especificaciones",
  is_active: "Activo",
  is_featured: "Destacado",
  warranty_note: "Garantía",
  sku: "Código",
  capacity: "Capacidad",
  color: "Color",
  color_hex: "Color (hex)",
  battery_health: "Batería",
  unlock_type: "Liberación",
  price_retail: "Precio por unidad",
  price_wholesale: "Precio al por mayor",
  compare_at_price: "Precio tachado",
  min_wholesale_qty: "Mín. al por mayor",
  stock: "Existencias",
  url: "Imagen",
  alt: "Texto alternativo",
};

const FIELD_ORDER = Object.keys(FIELD_LABELS);

const MONEY_FIELDS = new Set(["price_retail", "price_wholesale", "compare_at_price"]);
const MAX_TEXT = 120;

function truncate(value: string): string {
  return value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT - 1)}…` : value;
}

function isCondition(value: string): value is keyof typeof CONDITION_LABELS {
  return value in CONDITION_LABELS;
}

function isUnlock(value: string): value is keyof typeof UNLOCK_LABELS {
  return value === "factory" || value === "artista";
}

function formatValue(field: string, value: unknown, lookups: HistoryLookups): string {
  if (value === null || value === undefined || value === "") return EMPTY;
  if (typeof value === "boolean") return value ? "Sí" : "No";

  if (typeof value === "number") {
    if (MONEY_FIELDS.has(field)) return formatMoney(value);
    if (field === "battery_health") return formatBattery(value);
    return String(value);
  }

  if (typeof value === "string") {
    if (field === "category_id") return lookups.categories.get(value) ?? "Categoría eliminada";
    if (field === "brand_id") return lookups.brands.get(value) ?? "Marca eliminada";
    if (field === "condition" && isCondition(value)) return CONDITION_LABELS[value];
    if (field === "unlock_type" && isUnlock(value)) return UNLOCK_LABELS[value];
    return truncate(value);
  }

  if (field === "specs") {
    const parsed = z.record(z.string(), z.string()).safeParse(value);
    if (parsed.success) {
      const pairs = Object.entries(parsed.data).map(([key, item]) => `${key}: ${item}`);
      return pairs.length > 0 ? truncate(pairs.join("; ")) : EMPTY;
    }
  }
  return truncate(JSON.stringify(value));
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function textOf(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value !== "" ? value : null;
}

function numberOf(data: Record<string, unknown>, key: string): number | null {
  const value = data[key];
  return typeof value === "number" ? value : null;
}

/** "128 GB · Azul · Batería 92 % · Factory (RU-00012)": cómo se nombra una variante en el historial. */
function variantName(data: Record<string, unknown>): string {
  const unlock = textOf(data, "unlock_type");
  const label = variantLabel({
    capacity: textOf(data, "capacity"),
    color: textOf(data, "color"),
    batteryHealth: numberOf(data, "battery_health"),
    unlockType: unlock !== null && isUnlock(unlock) ? unlock : null,
  });
  const code = textOf(data, "sku");
  return [label, code ? `(${code})` : null].filter(Boolean).join(" ") || "sin nombre";
}

function subject(entity: "product" | "variant" | "image", data: Record<string, unknown>): string {
  if (entity === "variant") return `variante ${variantName(data)}`;
  if (entity === "image") return "imagen";
  return "producto";
}

const ACTION_VERB = {
  create: { product: "creado", variant: "agregada", image: "agregada" },
  update: { product: "modificado", variant: "modificada", image: "modificada" },
  delete: { product: "eliminado", variant: "eliminada", image: "eliminada" },
} as const;

function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  lookups: HistoryLookups,
): HistoryChange[] {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  // jsonb devuelve las claves en su propio orden: se muestran siempre en el de FIELD_LABELS.
  const position = (key: string) => {
    const index = FIELD_ORDER.indexOf(key);
    return index === -1 ? FIELD_ORDER.length : index;
  };
  return keys
    .filter((key) => !IGNORED.has(key) && !sameValue(before[key], after[key]))
    .sort((a, b) => position(a) - position(b))
    .map((key) => ({
      label: FIELD_LABELS[key] ?? key,
      before: formatValue(key, before[key], lookups),
      after: formatValue(key, after[key], lookups),
    }));
}

/** Convierte las filas de product_history en entradas legibles, en el mismo orden que llegan. */
export function describeHistory(rows: HistoryRow[], lookups: HistoryLookups): HistoryEntry[] {
  return rows.flatMap((row): HistoryEntry[] => {
    const action = row.action === "create" || row.action === "delete" ? row.action : "update";
    const entity = row.entity === "variant" || row.entity === "image" ? row.entity : "product";
    const oldData = record.safeParse(row.old_data).data ?? {};
    const newData = record.safeParse(row.new_data).data ?? {};
    const current = action === "delete" ? oldData : newData;

    const noun = subject(entity, current);
    const title = `${noun.charAt(0).toUpperCase()}${noun.slice(1)} ${ACTION_VERB[action][entity]}`;
    const changes = action === "update" ? diff(oldData, newData, lookups) : [];

    // Una modificación sin campos visibles (solo cambió algo que no se muestra) no aporta nada.
    if (action === "update" && changes.length === 0) return [];
    return [{ id: row.id, at: row.changed_at, action, title, changes }];
  });
}
