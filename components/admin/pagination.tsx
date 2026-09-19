import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Params = Record<string, string | undefined>;

function hrefFor(basePath: string, params: Params, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Paginación por enlaces (funciona sin JavaScript) que conserva los filtros de la URL. */
export function Pagination({
  basePath,
  params,
  page,
  totalPages,
  total,
}: {
  basePath: string;
  params: Params;
  page: number;
  totalPages: number;
  total: number;
}) {
  const linkClass =
    "border-border hover:bg-surface-2 focus-visible:ring-ring inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2";
  const disabledClass = "pointer-events-none opacity-40";

  return (
    <nav
      aria-label="Paginación"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-muted-foreground">
        {total} {total === 1 ? "resultado" : "resultados"} · Página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(basePath, params, page - 1)}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(linkClass, page <= 1 && disabledClass)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Anterior
        </Link>
        <Link
          href={hrefFor(basePath, params, page + 1)}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(linkClass, page >= totalPages && disabledClass)}
        >
          Siguiente <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
