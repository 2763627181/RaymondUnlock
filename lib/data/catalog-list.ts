import { normalizeText } from "@/lib/catalog/text";
import type {
  CatalogFacets,
  CatalogFilters,
  CatalogPage,
  CatalogProduct,
  CatalogVariant,
} from "@/types/catalog";
import {
  cardFor,
  categoryOf,
  categoryWithDescendantIds,
  productVariants,
  type CatalogIndex,
} from "./catalog-index";

function matchesQuery(index: CatalogIndex, product: CatalogProduct, query: string): boolean {
  const brand = product.brandId ? index.brandById.get(product.brandId) : undefined;
  const haystack = normalizeText(
    [product.name, brand?.name, categoryOf(index, product).name, product.shortDescription]
      .filter(Boolean)
      .join(" "),
  );
  return normalizeText(query)
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

function buildFacets(index: CatalogIndex, base: CatalogProduct[]): CatalogFacets {
  const brandCounts = new Map<string, number>();
  const conditionCounts = new Map<CatalogProduct["condition"], number>();
  const capacities = new Set<string>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const product of base) {
    if (product.brandId) {
      brandCounts.set(product.brandId, (brandCounts.get(product.brandId) ?? 0) + 1);
    }
    conditionCounts.set(product.condition, (conditionCounts.get(product.condition) ?? 0) + 1);
    for (const variant of productVariants(index, product)) {
      if (variant.capacity) capacities.add(variant.capacity);
      min = Math.min(min, variant.priceRetail);
      max = Math.max(max, variant.priceRetail);
    }
  }

  return {
    brands: [...brandCounts.entries()]
      .flatMap(([id, count]) => {
        const brand = index.brandById.get(id);
        return brand ? [{ slug: brand.slug, name: brand.name, count, order: brand.sortOrder }] : [];
      })
      .sort((a, b) => a.order - b.order)
      .map(({ slug, name, count }) => ({ slug, name, count })),
    conditions: [...conditionCounts.entries()].map(([value, count]) => ({ value, count })),
    capacities: [...capacities].sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    priceBounds: Number.isFinite(min) ? { min, max } : { min: 0, max: 0 },
  };
}

export function listProducts(index: CatalogIndex, filters: CatalogFilters): CatalogPage {
  const categoryIds = filters.categorySlug
    ? categoryWithDescendantIds(index, index.categoryBySlug.get(filters.categorySlug)?.id ?? "")
    : null;

  // Las facetas (marcas, capacidades, rango) se calculan sobre la categoría y
  // la búsqueda, no sobre los demás filtros, para no "vaciar" las opciones.
  const base = index.products.filter(
    (product) =>
      (categoryIds === null || categoryIds.has(product.categoryId)) &&
      (filters.query === null || matchesQuery(index, product, filters.query)),
  );

  const variantPasses = (variant: CatalogVariant): boolean =>
    (filters.capacities.length === 0 ||
      (variant.capacity !== null && filters.capacities.includes(variant.capacity))) &&
    (filters.priceMin === null || variant.priceRetail >= filters.priceMin) &&
    (filters.priceMax === null || variant.priceRetail <= filters.priceMax) &&
    (!filters.onlyInStock || variant.stock > 0);

  const brandIds = new Set(
    index.brands
      .filter((brand) => filters.brandSlugs.includes(brand.slug))
      .map((brand) => brand.id),
  );

  const filtered = base.filter(
    (product) =>
      (filters.brandSlugs.length === 0 ||
        (product.brandId !== null && brandIds.has(product.brandId))) &&
      (filters.conditions.length === 0 || filters.conditions.includes(product.condition)) &&
      productVariants(index, product).some(variantPasses),
  );

  const cards = filtered.map((product) => ({
    product,
    card: cardFor(index, product, variantPasses),
  }));

  cards.sort((a, b) => {
    switch (filters.sort) {
      case "precio-asc":
        return a.card.minPrice - b.card.minPrice;
      case "precio-desc":
        return b.card.minPrice - a.card.minPrice;
      case "nuevos":
        return b.product.createdAt.localeCompare(a.product.createdAt);
      case "relevancia":
        return (
          Number(b.product.isFeatured) - Number(a.product.isFeatured) ||
          a.product.sortOrder - b.product.sortOrder
        );
    }
  });

  return {
    items: cards.slice(0, filters.limit).map(({ card }) => card),
    total: cards.length,
    facets: buildFacets(index, base),
  };
}
