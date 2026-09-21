import { REQUEST_STATUS_LABELS } from "@/lib/admin/status";
import type { RequestFilters } from "@/lib/admin/quotes-query";

/** Qué filtros tiene el listado que se está exportando, para decirlo bajo el título del informe. */
export function describeFilters(
  filters: Pick<RequestFilters, "q" | "status">,
  everything: string,
): string {
  const parts: string[] = [];
  if (filters.status) parts.push(`Estado: ${REQUEST_STATUS_LABELS[filters.status]}`);
  const text = filters.q.trim();
  if (text) parts.push(`Búsqueda: “${text}”`);
  return parts.length > 0 ? parts.join(" · ") : everything;
}
