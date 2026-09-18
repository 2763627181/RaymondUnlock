"use client";

import type { ReactNode } from "react";
import { FiltersPanel } from "@/components/catalog/filters-panel";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CatalogFacets } from "@/types/catalog";

export function FiltersSheetBody({
  facets,
  categoryNav,
  total,
}: {
  facets: CatalogFacets;
  categoryNav: ReactNode;
  total: number;
}) {
  return (
    <>
      <SheetHeader className="border-border border-b">
        <SheetTitle>Filtros</SheetTitle>
        <SheetDescription className="sr-only">
          Filtra los productos por marca, condición, precio y disponibilidad.
        </SheetDescription>
      </SheetHeader>
      <div className="overflow-y-auto px-4">
        <FiltersPanel facets={facets} categoryNav={categoryNav} idPrefix="movil" />
      </div>
      <SheetFooter className="border-border border-t">
        <SheetClose asChild>
          <Button className="h-11 w-full text-base">
            Ver {total} {total === 1 ? "resultado" : "resultados"}
          </Button>
        </SheetClose>
      </SheetFooter>
    </>
  );
}
