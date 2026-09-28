import { normalizeText } from "@/lib/catalog/text";
import type { WholesaleFilters, WholesaleItem } from "@/lib/wholesale/types";

export interface CategoryGroup {
  category: string;
  items: WholesaleItem[];
}

/** Días que un producto recién agregado sale destacado con la etiqueta "Nuevo". */
export const RECENT_WHOLESALE_DAYS = 14;

/** true si se creó dentro de la ventana de "reciente" (nunca por una fecha futura). */
export function isRecentWholesaleItem(item: WholesaleItem, now: Date = new Date()): boolean {
  const ageMs = now.getTime() - new Date(item.createdAt).getTime();
  return ageMs >= 0 && ageMs <= RECENT_WHOLESALE_DAYS * 24 * 60 * 60 * 1000;
}

/** Dentro de una categoría, lo recién agregado va primero (más nuevo primero); el resto conserva su orden. */
function recentFirst(items: WholesaleItem[], now: Date): WholesaleItem[] {
  const recent = items.filter((item) => isRecentWholesaleItem(item, now));
  if (recent.length === 0) return items;
  const rest = items.filter((item) => !isRecentWholesaleItem(item, now));
  recent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return [...recent, ...rest];
}

export interface WholesaleFacets {
  types: string[];
  categories: string[];
  conditions: string[];
}

/** Cada palabra escrita debe aparecer en el nombre, tipo, categoría o condición (sin acentos ni mayúsculas). */
function matchesQuery(item: WholesaleItem, words: string[]): boolean {
  if (words.length === 0) return true;
  const haystack = normalizeText(`${item.name} ${item.type} ${item.category} ${item.condition}`);
  return words.every((word) => haystack.includes(word));
}

const oneOf = (selected: string[], value: string) =>
  selected.length === 0 || selected.includes(value);

export function filterItems(items: WholesaleItem[], filters: WholesaleFilters): WholesaleItem[] {
  const words = normalizeText(filters.query).split(/\s+/).filter(Boolean);
  return items.filter(
    (item) =>
      oneOf(filters.types, item.type) &&
      oneOf(filters.categories, item.category) &&
      oneOf(filters.conditions, item.condition) &&
      matchesQuery(item, words),
  );
}

/**
 * Agrupa por categoría respetando el orden de la lista (la primera que aparece va
 * primero) y adelanta, dentro de cada categoría, lo que se agregó hace poco.
 */
export function groupByCategory(items: WholesaleItem[], now: Date = new Date()): CategoryGroup[] {
  const groups = new Map<string, WholesaleItem[]>();
  for (const item of items) {
    const group = groups.get(item.category);
    if (group) group.push(item);
    else groups.set(item.category, [item]);
  }
  return [...groups].map(([category, grouped]) => ({
    category,
    items: recentFirst(grouped, now),
  }));
}

function distinct(values: string[]): string[] {
  return [...new Set(values)];
}

/** Las opciones de los filtros salen de lo que hay en la lista, en el orden en que aparecen. */
export function facetsOf(items: WholesaleItem[]): WholesaleFacets {
  return {
    types: distinct(items.map((item) => item.type)),
    categories: distinct(items.map((item) => item.category)),
    conditions: distinct(items.map((item) => item.condition)),
  };
}

/** Cuántos grupos de filtro hay activos (la búsqueda por texto no cuenta). */
export function activeFilterCount(filters: WholesaleFilters): number {
  return [filters.types, filters.categories, filters.conditions].filter((list) => list.length > 0)
    .length;
}

export function hasActiveSearch(filters: WholesaleFilters): boolean {
  return filters.query.trim() !== "" || activeFilterCount(filters) > 0;
}
