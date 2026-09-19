import type { CatalogFilters, ProductCondition, SortOption } from "@/types/catalog";

/*
 * Este módulo lo importan componentes del navegador (los filtros leen la URL),
 * por eso NO usa Zod: arrastraría ~90 KB a la carga de /tienda. Las reglas son
 * las mismas que tenía el esquema y están cubiertas por search-params.test.ts.
 */

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 96;
const MAX_PRICE = 10_000_000;
const MAX_LIST_ITEMS = 12;

const SLUG = /^[a-z0-9-]{1,60}$/;
const CONDITIONS: readonly ProductCondition[] = ["nuevo", "open_box", "usado", "reacondicionado"];
const SORTS: readonly SortOption[] = ["relevancia", "precio-asc", "precio-desc", "nuevos"];

type Parser<T> = (value: string) => T | null;

const parseSlug: Parser<string> = (value) => (SLUG.test(value) ? value : null);

const parseCondition: Parser<ProductCondition> = (value) =>
  CONDITIONS.find((condition) => condition === value) ?? null;

const parseSort: Parser<SortOption> = (value) => SORTS.find((sort) => sort === value) ?? null;

const parseCapacity: Parser<string> = (value) => {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 30 ? trimmed : null;
};

const parseQuery: Parser<string> = (value) => {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 60 ? trimmed : null;
};

const parsePrice: Parser<number> = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= MAX_PRICE ? number : null;
};

const parseLimit: Parser<number> = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= DEFAULT_PAGE_SIZE && number <= MAX_PAGE_SIZE
    ? number
    : null;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function listOf<T>(raw: string | string[] | undefined, parse: Parser<T>): T[] {
  const value = first(raw);
  if (!value) return [];
  const items: T[] = [];
  for (const part of value.split(",")) {
    const parsed = parse(part);
    if (parsed !== null && !items.includes(parsed)) items.push(parsed);
    if (items.length === MAX_LIST_ITEMS) break;
  }
  return items;
}

function single<T>(raw: string | string[] | undefined, parse: Parser<T>): T | null {
  const value = first(raw);
  return value === undefined || value === "" ? null : parse(value);
}

/** Parsea filtros desde la URL. Los valores inválidos se descartan en silencio. */
export function parseCatalogFilters(
  params: RawSearchParams,
  categorySlug: string | null,
): CatalogFilters {
  const priceMin = single(params.precio_min, parsePrice);
  const priceMax = single(params.precio_max, parsePrice);
  const swapped = priceMin !== null && priceMax !== null && priceMin > priceMax;

  return {
    categorySlug,
    brandSlugs: listOf(params.marca, parseSlug),
    conditions: listOf(params.condicion, parseCondition),
    priceMin: swapped ? priceMax : priceMin,
    priceMax: swapped ? priceMin : priceMax,
    capacities: listOf(params.capacidad, parseCapacity),
    onlyInStock: first(params.stock) === "1",
    query: single(params.q, parseQuery),
    sort: single(params.orden, parseSort) ?? "relevancia",
    limit: single(params.limite, parseLimit) ?? DEFAULT_PAGE_SIZE,
  };
}

/** Cantidad de grupos de filtro activos (orden y paginación no cuentan). */
export function countActiveFilters(filters: CatalogFilters): number {
  return [
    filters.brandSlugs.length > 0,
    filters.conditions.length > 0,
    filters.priceMin !== null || filters.priceMax !== null,
    filters.capacities.length > 0,
    filters.onlyInStock,
    filters.query !== null,
  ].filter(Boolean).length;
}

/** Serializa filtros a query string. Omite los valores por defecto. */
export function serializeCatalogFilters(
  filters: CatalogFilters,
  options: { includePagination: boolean } = { includePagination: true },
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.brandSlugs.length) params.set("marca", filters.brandSlugs.join(","));
  if (filters.conditions.length) params.set("condicion", filters.conditions.join(","));
  if (filters.priceMin !== null) params.set("precio_min", String(filters.priceMin));
  if (filters.priceMax !== null) params.set("precio_max", String(filters.priceMax));
  if (filters.capacities.length) params.set("capacidad", filters.capacities.join(","));
  if (filters.onlyInStock) params.set("stock", "1");
  if (filters.sort !== "relevancia") params.set("orden", filters.sort);
  if (options.includePagination && filters.limit !== DEFAULT_PAGE_SIZE) {
    params.set("limite", String(filters.limit));
  }
  return params;
}
