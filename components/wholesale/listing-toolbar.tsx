"use client";

import type { Ref } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/wholesale/format";

/** Buscador y barra de filtros con la cantidad de productos que se están viendo. */
export function ListingToolbar({
  query,
  onQueryChange,
  onFocusChange,
  activeFilters,
  onOpenFilters,
  shown,
  inputRef,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onFocusChange: (focused: boolean) => void;
  activeFilters: number;
  onOpenFilters: () => void;
  shown: number;
  inputRef: Ref<HTMLInputElement>;
}) {
  return (
    <div className="bg-surface border-border sticky top-0 z-20 border-b">
      <div className="p-4 pb-3">
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
            placeholder="Buscar producto o categoría…"
            aria-label="Buscar en el listado"
            autoComplete="off"
            className="border-border bg-surface-2 focus-visible:ring-ring h-12 w-full rounded-xl border pr-11 pl-12 text-[15px] outline-none focus-visible:ring-2 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Borrar búsqueda"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-border flex items-center justify-between border-t px-4 py-2.5">
        <Button variant="outline" className="h-10 rounded-xl px-4" onClick={onOpenFilters}>
          <SlidersHorizontal aria-hidden="true" /> Filtros
          {activeFilters > 0 ? (
            <span className="bg-brand-red-600 ml-0.5 grid min-w-5 place-items-center rounded-full px-1.5 text-xs font-semibold text-white">
              {activeFilters}
            </span>
          ) : null}
        </Button>
        <p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
          {formatCount(shown)} {shown === 1 ? "producto" : "productos"}
        </p>
      </div>
    </div>
  );
}
