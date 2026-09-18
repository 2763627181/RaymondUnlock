import Link from "next/link";
import { X } from "lucide-react";
import { CONDITION_LABELS } from "@/lib/catalog/text";
import { countActiveFilters, serializeCatalogFilters } from "@/lib/catalog/search-params";
import { formatPrice } from "@/lib/format";
import type { CatalogFacets, CatalogFilters } from "@/types/catalog";

interface Chip {
  key: string;
  label: string;
  without: Partial<CatalogFilters>;
}

function buildChips(filters: CatalogFilters, facets: CatalogFacets): Chip[] {
  const brandNames = new Map(facets.brands.map((brand) => [brand.slug, brand.name]));
  const chips: Chip[] = [];

  if (filters.query) {
    chips.push({ key: "q", label: `Búsqueda: ${filters.query}`, without: { query: null } });
  }
  for (const slug of filters.brandSlugs) {
    chips.push({
      key: `marca-${slug}`,
      label: brandNames.get(slug) ?? slug,
      without: { brandSlugs: filters.brandSlugs.filter((item) => item !== slug) },
    });
  }
  for (const condition of filters.conditions) {
    chips.push({
      key: `condicion-${condition}`,
      label: CONDITION_LABELS[condition],
      without: { conditions: filters.conditions.filter((item) => item !== condition) },
    });
  }
  if (filters.priceMin !== null || filters.priceMax !== null) {
    const from = filters.priceMin !== null ? formatPrice(filters.priceMin) : "Cualquiera";
    const to = filters.priceMax !== null ? formatPrice(filters.priceMax) : "Cualquiera";
    chips.push({
      key: "precio",
      label: `${from} – ${to}`,
      without: { priceMin: null, priceMax: null },
    });
  }
  for (const capacity of filters.capacities) {
    chips.push({
      key: `capacidad-${capacity}`,
      label: capacity,
      without: { capacities: filters.capacities.filter((item) => item !== capacity) },
    });
  }
  if (filters.onlyInStock) {
    chips.push({ key: "stock", label: "Solo con existencia", without: { onlyInStock: false } });
  }
  return chips;
}

export function ActiveFilters({
  filters,
  facets,
  basePath,
}: {
  filters: CatalogFilters;
  facets: CatalogFacets;
  basePath: string;
}) {
  if (countActiveFilters(filters) === 0) return null;

  const hrefFor = (patch: Partial<CatalogFilters>) => {
    const query = serializeCatalogFilters({ ...filters, ...patch }, { includePagination: false });
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <ul className="mb-6 flex flex-wrap items-center gap-2" aria-label="Filtros activos">
      {buildChips(filters, facets).map((chip) => (
        <li key={chip.key}>
          <Link
            href={hrefFor(chip.without)}
            scroll={false}
            className="bg-surface-2 hover:bg-border focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full py-1 pr-2 pl-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2"
          >
            {chip.label}
            <X className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Quitar filtro</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
