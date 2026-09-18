import { z } from "zod";
import type { CatalogFilters, ProductCondition, SortOption } from "@/types/catalog";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 96;
const MAX_PRICE = 10_000_000;

const slugSchema = z.string().regex(/^[a-z0-9-]{1,60}$/);
const conditionSchema = z.enum(["nuevo", "open_box", "usado", "reacondicionado"]);
const capacitySchema = z.string().trim().min(1).max(30);
const sortSchema = z.enum(["relevancia", "precio-asc", "precio-desc", "nuevos"]);
const priceSchema = z.coerce.number().min(0).max(MAX_PRICE);
const querySchema = z.string().trim().min(1).max(60);
const limitSchema = z.coerce.number().int().min(DEFAULT_PAGE_SIZE).max(MAX_PAGE_SIZE);

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function csvOf<T>(raw: string | string[] | undefined, schema: z.ZodType<T>, max = 12): T[] {
  const value = first(raw);
  if (!value) return [];
  const items: T[] = [];
  for (const part of value.split(",")) {
    const parsed = schema.safeParse(part);
    if (parsed.success && !items.includes(parsed.data)) items.push(parsed.data);
    if (items.length === max) break;
  }
  return items;
}

function optional<T>(raw: string | string[] | undefined, schema: z.ZodType<T>): T | null {
  const value = first(raw);
  if (value === undefined || value === "") return null;
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Parsea filtros desde la URL. Los valores inválidos se descartan en silencio. */
export function parseCatalogFilters(
  params: RawSearchParams,
  categorySlug: string | null,
): CatalogFilters {
  const priceMin = optional(params.precio_min, priceSchema);
  const priceMax = optional(params.precio_max, priceSchema);
  const swapped = priceMin !== null && priceMax !== null && priceMin > priceMax;

  return {
    categorySlug,
    brandSlugs: csvOf(params.marca, slugSchema),
    conditions: csvOf<ProductCondition>(params.condicion, conditionSchema),
    priceMin: swapped ? priceMax : priceMin,
    priceMax: swapped ? priceMin : priceMax,
    capacities: csvOf(params.capacidad, capacitySchema),
    onlyInStock: first(params.stock) === "1",
    query: optional(params.q, querySchema),
    sort: optional<SortOption>(params.orden, sortSchema) ?? "relevancia",
    limit: optional(params.limite, limitSchema) ?? DEFAULT_PAGE_SIZE,
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
