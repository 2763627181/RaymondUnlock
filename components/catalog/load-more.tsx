"use client";

import { Button } from "@/components/ui/button";
import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton";
import { useCatalogFilters } from "@/components/catalog/use-catalog-filters";
import { DEFAULT_PAGE_SIZE } from "@/lib/catalog/search-params";

export function LoadMore({ shown, total }: { shown: number; total: number }) {
  const { loadMore, isPending } = useCatalogFilters();

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Mostrando {shown} de {total} productos
      </p>
      {isPending ? <ProductGridSkeleton count={4} className="w-full" /> : null}
      {shown < total ? (
        <Button
          variant="outline"
          className="h-11 px-8 text-base"
          disabled={isPending}
          onClick={() => loadMore(DEFAULT_PAGE_SIZE)}
        >
          {isPending ? "Cargando…" : "Cargar más"}
        </Button>
      ) : null}
    </div>
  );
}
