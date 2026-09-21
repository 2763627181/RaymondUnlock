"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WholesaleFacets } from "@/lib/wholesale/filter";
import type { WholesaleFilters } from "@/lib/wholesale/types";
import { cn } from "@/lib/utils";

type FilterKey = "types" | "categories" | "conditions";

const SECTIONS: { key: FilterKey; title: string }[] = [
  { key: "types", title: "Tipo de producto" },
  { key: "categories", title: "Categoría" },
  { key: "conditions", title: "Condición" },
];

function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "focus-visible:ring-ring rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
        selected
          ? "border-ink bg-ink text-white"
          : "border-border bg-surface text-ink-700 hover:bg-surface-2",
      )}
    >
      {label}
    </button>
  );
}

/** Filtros por tipo, categoría y condición. Se editan como borrador y se aplican con el botón. */
export function FiltersDialog({
  open,
  onOpenChange,
  facets,
  filters,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facets: WholesaleFacets;
  filters: WholesaleFilters;
  onApply: (next: Pick<WholesaleFilters, FilterKey>) => void;
}) {
  const [draft, setDraft] = useState<Pick<WholesaleFilters, FilterKey>>({
    types: filters.types,
    categories: filters.categories,
    conditions: filters.conditions,
  });

  // Cada vez que se abre, el borrador parte de lo que está aplicado.
  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft({
        types: filters.types,
        categories: filters.categories,
        conditions: filters.conditions,
      });
    }
    onOpenChange(next);
  }

  function toggle(key: FilterKey, value: string) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[88dvh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-border border-b p-6 pb-4">
          <DialogTitle className="text-2xl">Filtros</DialogTitle>
          <DialogDescription>Usa tipo, categoría y condición del listado.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-7 overflow-y-auto p-6">
          {SECTIONS.map(({ key, title }) =>
            facets[key].length > 0 ? (
              <section key={key} aria-labelledby={`filtro-${key}`}>
                <h3 id={`filtro-${key}`} className="mb-3 text-base font-semibold">
                  {title}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {facets[key].map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      selected={draft[key].includes(value)}
                      onToggle={() => toggle(key, value)}
                    />
                  ))}
                </div>
              </section>
            ) : null,
          )}
        </div>

        <DialogFooter className="border-border mx-0 mb-0 flex-row justify-end gap-3 border-t p-4 sm:p-5">
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 text-base"
            onClick={() => {
              onApply({ types: [], categories: [], conditions: [] });
              onOpenChange(false);
            }}
          >
            Limpiar filtros
          </Button>
          <Button
            className="h-12 rounded-xl px-6 text-base"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
          >
            Aplicar filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
