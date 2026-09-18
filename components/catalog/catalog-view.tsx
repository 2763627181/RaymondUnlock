import { ActiveFilters } from "@/components/catalog/active-filters";
import { CategoryNav } from "@/components/catalog/category-nav";
import { EmptyState } from "@/components/catalog/empty-state";
import { FiltersPanel } from "@/components/catalog/filters-panel";
import { FiltersSheet } from "@/components/catalog/filters-sheet";
import { LoadMore } from "@/components/catalog/load-more";
import { SortSelect } from "@/components/catalog/sort-select";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategories, getSiteSettings, listProducts } from "@/lib/data";
import { countActiveFilters } from "@/lib/catalog/search-params";
import type { CatalogFilters, Category } from "@/types/catalog";

function buildCrumbs(category: Category | null, all: Category[]): Crumb[] {
  const crumbs: Crumb[] = [
    { name: "Inicio", path: "/" },
    { name: "Tienda", path: "/tienda" },
  ];
  if (!category) return crumbs;
  const parent = category.parentId ? all.find((item) => item.id === category.parentId) : undefined;
  if (parent) crumbs.push({ name: parent.name, path: `/tienda/${parent.slug}` });
  crumbs.push({ name: category.name, path: `/tienda/${category.slug}` });
  return crumbs;
}

export async function CatalogView({
  category,
  filters,
}: {
  category: Category | null;
  filters: CatalogFilters;
}) {
  const [page, categories, settings] = await Promise.all([
    listProducts(filters),
    getCategories(),
    getSiteSettings(),
  ]);

  const basePath = category ? `/tienda/${category.slug}` : "/tienda";
  const hasFilters = countActiveFilters(filters) > 0;
  const categoryNav = <CategoryNav categories={categories} activeSlug={category?.slug ?? null} />;
  const title = category?.name ?? (filters.query ? `Resultados para “${filters.query}”` : "Tienda");

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={buildCrumbs(category, categories)} />

      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {category?.description ? (
          <p className="text-muted-foreground mt-2 max-w-2xl text-[15px] leading-relaxed">
            {category.description}
          </p>
        ) : null}
      </header>

      <div className="mb-6 flex items-center justify-between gap-3">
        <FiltersSheet facets={page.facets} categoryNav={categoryNav} total={page.total} />
        <p className="text-muted-foreground hidden text-sm lg:block">
          {page.total} {page.total === 1 ? "producto" : "productos"}
        </p>
        <SortSelect />
      </div>

      <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto pr-3">
            <FiltersPanel facets={page.facets} categoryNav={categoryNav} idPrefix="escritorio" />
          </div>
        </aside>

        <div>
          <ActiveFilters filters={filters} facets={page.facets} basePath={basePath} />
          {page.items.length > 0 ? (
            <>
              <ProductGrid products={page.items} />
              <LoadMore shown={page.items.length} total={page.total} />
            </>
          ) : (
            <EmptyState
              categories={categories.filter((item) => item.parentId === null)}
              whatsappNumber={settings.whatsappNumber}
              query={filters.query}
              hasFilters={hasFilters}
              clearHref={basePath}
            />
          )}
        </div>
      </div>
    </Container>
  );
}
