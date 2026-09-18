import type { Metadata } from "next";
import { countActiveFilters, serializeCatalogFilters } from "@/lib/catalog/search-params";
import type { CatalogFilters } from "@/types/catalog";

/**
 * Un filtro activo se puede indexar (con canónica propia); con dos o más, o con
 * una búsqueda de texto, la página es noindex para no crear contenido duplicado.
 * El orden y la paginación nunca cambian la canónica.
 */
export function buildCatalogMetadata(input: {
  title: string;
  description: string;
  basePath: string;
  filters: CatalogFilters;
}): Metadata {
  const { title, description, basePath, filters } = input;
  const activeFilters = countActiveFilters(filters);
  const query = serializeCatalogFilters(
    { ...filters, sort: "relevancia" },
    { includePagination: false },
  ).toString();
  const canonical =
    activeFilters === 1 && filters.query === null && query ? `${basePath}?${query}` : basePath;
  const noindex = activeFilters > 1 || filters.query !== null;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: canonical },
  };
}
