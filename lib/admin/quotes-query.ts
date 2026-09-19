import { isRequestStatus, type RequestStatus } from "@/lib/admin/status";
import { parsePage } from "@/lib/admin/pagination";

export interface RequestFilters {
  q: string;
  status: RequestStatus | "";
  tier: "retail" | "wholesale" | "";
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Filtros de la URL (?q=&estado=&tipo=&page=), ya validados. */
export function parseRequestFilters(params: RawParams): RequestFilters {
  const status = first(params.estado);
  const tier = first(params.tipo);
  return {
    q: first(params.q).slice(0, 80),
    status: isRequestStatus(status) ? status : "",
    tier: tier === "retail" || tier === "wholesale" ? tier : "",
    page: parsePage(params.page),
  };
}

/** Cláusula `or` de PostgREST para buscar por texto; null si no hay búsqueda. */
export function searchClause(query: string, columns: string[]): string | null {
  // Estos caracteres tienen significado dentro del filtro `or` o del patrón ilike.
  const safe = query.replace(/[%_,()\\*]/g, " ").trim();
  if (!safe) return null;
  return columns.map((column) => `${column}.ilike.%${safe}%`).join(",");
}

export function filtersToParams(filters: RequestFilters): Record<string, string> {
  return { q: filters.q, estado: filters.status, tipo: filters.tier };
}
