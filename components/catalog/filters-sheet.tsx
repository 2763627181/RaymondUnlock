"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogFilters } from "@/components/catalog/use-catalog-filters";
import { countActiveFilters } from "@/lib/catalog/search-params";
import type { CatalogFacets } from "@/types/catalog";

// El panel solo se descarga la primera vez que se abre.
const FiltersSheetPanel = dynamic(
  () => import("@/components/catalog/filters-sheet-panel").then((mod) => mod.FiltersSheetPanel),
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
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="h-10 gap-2 px-4 lg:hidden"
        aria-haspopup="dialog"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
      >
        <SlidersHorizontal aria-hidden="true" />
        Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
      </Button>
      {loaded ? (
        <FiltersSheetPanel
          open={open}
          onOpenChange={setOpen}
          facets={facets}
          categoryNav={categoryNav}
          total={total}
        />
      ) : null}
    </>
  );
}
