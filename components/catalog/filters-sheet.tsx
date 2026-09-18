"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCatalogFilters } from "@/components/catalog/use-catalog-filters";
import { countActiveFilters } from "@/lib/catalog/search-params";
import type { CatalogFacets } from "@/types/catalog";

// El contenido solo se descarga la primera vez que se abre el panel.
const FiltersSheetBody = dynamic(
  () => import("@/components/catalog/filters-sheet-body").then((mod) => mod.FiltersSheetBody),
  { ssr: false },
);

export function FiltersSheet({
  facets,
  categoryNav,
  total,
}: {
  facets: CatalogFacets;
  categoryNav: ReactNode;
  total: number;
}) {
  const { filters } = useCatalogFilters();
  const activeCount = countActiveFilters(filters);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 px-4 lg:hidden">
          <SlidersHorizontal aria-hidden="true" />
          Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85svh] gap-0 rounded-t-2xl">
        <FiltersSheetBody facets={facets} categoryNav={categoryNav} total={total} />
      </SheetContent>
    </Sheet>
  );
}
