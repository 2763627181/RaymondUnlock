"use client";

import type { ReactNode } from "react";
import { FilterGroup } from "@/components/catalog/filter-group";
import { PriceFilter } from "@/components/catalog/price-filter";
import { useCatalogFilters } from "@/components/catalog/use-catalog-filters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CONDITION_LABELS } from "@/lib/catalog/text";
import { countActiveFilters } from "@/lib/catalog/search-params";
import { cn } from "@/lib/utils";
import type { CatalogFacets, ProductCondition } from "@/types/catalog";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function FiltersPanel({
  facets,
  categoryNav,
  idPrefix,
}: {
  facets: CatalogFacets;
  categoryNav: ReactNode;
  idPrefix: string;
}) {
  const { filters, update, clear, isPending } = useCatalogFilters();
  const activeCount = countActiveFilters(filters);

  return (
    <div className={cn("transition-opacity", isPending && "opacity-60")} aria-busy={isPending}>
      {categoryNav}

      {facets.brands.length > 0 ? (
        <FilterGroup title="Marca">
          <ul className="space-y-2.5">
            {facets.brands.map((brand) => {
              const id = `${idPrefix}-marca-${brand.slug}`;
              return (
                <li key={brand.slug} className="flex items-center gap-2.5">
                  <Checkbox
                    id={id}
                    checked={filters.brandSlugs.includes(brand.slug)}
                    onCheckedChange={() =>
                      update({ brandSlugs: toggle(filters.brandSlugs, brand.slug) })
                    }
                  />
                  <Label htmlFor={id} className="flex-1 cursor-pointer text-sm font-normal">
                    {brand.name}
                  </Label>
                  <span className="text-muted-foreground text-xs">{brand.count}</span>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      ) : null}

      {facets.conditions.length > 1 ? (
        <FilterGroup title="Condición">
          <ul className="space-y-2.5">
            {facets.conditions.map(({ value, count }) => {
              const id = `${idPrefix}-condicion-${value}`;
              return (
                <li key={value} className="flex items-center gap-2.5">
                  <Checkbox
                    id={id}
                    checked={filters.conditions.includes(value)}
                    onCheckedChange={() =>
                      update({ conditions: toggle<ProductCondition>(filters.conditions, value) })
                    }
                  />
                  <Label htmlFor={id} className="flex-1 cursor-pointer text-sm font-normal">
                    {CONDITION_LABELS[value]}
                  </Label>
                  <span className="text-muted-foreground text-xs">{count}</span>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      ) : null}

      {facets.priceBounds.min < facets.priceBounds.max ? (
        <FilterGroup title="Precio">
          <PriceFilter
            key={`${filters.priceMin ?? "min"}-${filters.priceMax ?? "max"}`}
            bounds={facets.priceBounds}
            priceMin={filters.priceMin}
            priceMax={filters.priceMax}
            onCommit={(range) => update(range)}
          />
        </FilterGroup>
      ) : null}

      {facets.capacities.length > 0 ? (
        <FilterGroup title="Capacidad y tamaño">
          <div className="flex flex-wrap gap-2">
            {facets.capacities.map((capacity) => {
              const pressed = filters.capacities.includes(capacity);
              return (
                <button
                  key={capacity}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => update({ capacities: toggle(filters.capacities, capacity) })}
                  className={cn(
                    "focus-visible:ring-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
                    pressed
                      ? "border-ink bg-ink text-surface"
                      : "border-border bg-surface hover:bg-surface-2",
                  )}
                >
                  {capacity}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Disponibilidad">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${idPrefix}-stock`} className="cursor-pointer text-sm font-normal">
            Solo con existencia
          </Label>
          <Switch
            id={`${idPrefix}-stock`}
            checked={filters.onlyInStock}
            onCheckedChange={(checked) => update({ onlyInStock: checked })}
          />
        </div>
      </FilterGroup>

      {activeCount > 0 ? (
        <Button variant="outline" className="mt-2 w-full" onClick={clear}>
          Limpiar filtros ({activeCount})
        </Button>
      ) : null}
    </div>
  );
}
