"use client";

import { useCatalogFilters } from "@/components/catalog/use-catalog-filters";
import { SORT_LABELS } from "@/lib/catalog/text";
import type { SortOption } from "@/types/catalog";

const OPTIONS = Object.keys(SORT_LABELS) as SortOption[];

export function SortSelect() {
  const { filters, update, isPending } = useCatalogFilters();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="orden" className="text-muted-foreground hidden text-sm sm:block">
        Ordenar por
      </label>
      <select
        id="orden"
        aria-label="Ordenar por"
        value={filters.sort}
        disabled={isPending}
        onChange={(event) => {
          const next = OPTIONS.find((option) => option === event.target.value);
          if (next) update({ sort: next });
        }}
        className="border-input bg-surface focus-visible:ring-ring h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
