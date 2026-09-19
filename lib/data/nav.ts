import { CONDITION_LABELS } from "@/lib/catalog/text";
import type { NavCategory, NavPromo } from "@/types/site";
import { categoryWithDescendantIds, type CatalogIndex } from "./catalog-index";

/** El menú principal muestra las primeras categorías; el resto vive en /tienda. */
const NAV_CATEGORY_LIMIT = 5;

export function buildNavCategories(
  index: CatalogIndex,
  promos: Record<string, NavPromo>,
): NavCategory[] {
  const topLevel = index.categories
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, NAV_CATEGORY_LIMIT);

  return topLevel.map((category) => {
    const ids = categoryWithDescendantIds(index, category.id);
    const inCategory = index.products.filter((product) => ids.has(product.categoryId));
    const children = index.categories
      .filter((child) => child.parentId === category.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const subcategories =
      children.length > 0
        ? children.map((child) => ({
            slug: child.slug,
            name: child.name,
            href: `/tienda/${child.slug}`,
          }))
        : [...new Set(inCategory.map((product) => product.condition))].map((condition) => ({
            slug: condition,
            name: CONDITION_LABELS[condition],
            href: `/tienda/${category.slug}?condicion=${condition}`,
          }));

    const brandIds = new Set(
      inCategory.flatMap((product) => (product.brandId ? [product.brandId] : [])),
    );
    const navBrands = index.brands
      .filter((brand) => brandIds.has(brand.id))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((brand) => ({
        slug: brand.slug,
        name: brand.name,
        href: `/tienda/${category.slug}?marca=${brand.slug}`,
      }));

    return {
      slug: category.slug,
      name: category.name,
      href: `/tienda/${category.slug}`,
      subcategories,
      brands: navBrands,
      promo: promos[category.slug] ?? null,
    };
  });
}
