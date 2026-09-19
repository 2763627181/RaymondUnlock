export const ADMIN_PAGE_SIZE = 20;

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page >= 1 ? Math.min(page, 10_000) : 1;
}

/** Rango inclusivo para `.range(from, to)` de PostgREST. */
export function pageRange(page: number, size: number = ADMIN_PAGE_SIZE) {
  const from = (page - 1) * size;
  return { from, to: from + size - 1 };
}

export function totalPages(total: number, size: number = ADMIN_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}
