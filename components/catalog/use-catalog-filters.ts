"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseCatalogFilters, serializeCatalogFilters } from "@/lib/catalog/search-params";
import type { CatalogFilters } from "@/types/catalog";

/** Los filtros viven en la URL: compartibles, indexables y con "atrás" funcional. */
export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () => parseCatalogFilters(Object.fromEntries(searchParams.entries()), null),
    [searchParams],
  );

  const navigate = useCallback(
    (next: CatalogFilters, includePagination: boolean) => {
      const query = serializeCatalogFilters(next, { includePagination }).toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router],
  );

  /** Cambiar un filtro reinicia la paginación. */
  const update = useCallback(
    (patch: Partial<CatalogFilters>) => navigate({ ...filters, ...patch }, false),
    [filters, navigate],
  );

  const loadMore = useCallback(
    (step: number) => navigate({ ...filters, limit: filters.limit + step }, true),
    [filters, navigate],
  );

  const clear = useCallback(
    () =>
      navigate(
        {
          ...filters,
          brandSlugs: [],
          conditions: [],
          priceMin: null,
          priceMax: null,
          capacities: [],
          onlyInStock: false,
          query: null,
        },
        false,
      ),
    [filters, navigate],
  );

  return { filters, update, loadMore, clear, isPending };
}
