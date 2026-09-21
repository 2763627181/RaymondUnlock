import { normalizeText } from "@/lib/catalog/text";
import type { WholesaleFilters, WholesaleItem } from "@/lib/wholesale/types";

export interface CategoryGroup {
  category: string;
  items: WholesaleItem[];
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

/** Agrupa por categoría respetando el orden de la lista: la primera que aparece va primero. */
export function groupByCategory(items: WholesaleItem[]): CategoryGroup[] {
  const groups = new Map<string, WholesaleItem[]>();
  for (const item of items) {
    const group = groups.get(item.category);
    if (group) group.push(item);
    else groups.set(item.category, [item]);
  }
  return [...groups].map(([category, grouped]) => ({ category, items: grouped }));
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
