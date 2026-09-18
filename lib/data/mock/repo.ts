import "server-only";
import type {
  Brand,
  CatalogFacets,
  CatalogFilters,
  CatalogPage,
  CatalogProduct,
  CatalogVariant,
  Category,
  ProductCardData,
  ProductDetail,
} from "@/types/catalog";
import type { Banner, NavCategory, Service, SiteSettings } from "@/types/site";
import type { VariantPricingRow } from "@/lib/cart/pricing";
import { toCardData, variantLabel } from "@/lib/catalog/cards";
import { CONDITION_LABELS, normalizeText } from "@/lib/catalog/text";
import { products, variants } from "./catalog";
import { productImages } from "./images";
import { bannersBase, services } from "./services";
import { siteSettings } from "./settings";
import { brands, categories } from "./taxonomy";
import { getWholesaleTerms } from "./wholesale";

/** El menú principal muestra las primeras categorías; el resto vive en /tienda. */
const NAV_CATEGORY_LIMIT = 5;

const categoryById = new Map(categories.map((category) => [category.id, category]));
const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
const brandById = new Map(brands.map((brand) => [brand.id, brand]));
const productBySlug = new Map(products.map((product) => [product.slug, product]));
const variantsByProduct = new Map<string, CatalogVariant[]>();
for (const variant of variants) {
  const list = variantsByProduct.get(variant.productId) ?? [];
  list.push(variant);
  variantsByProduct.set(variant.productId, list);
}

function imagesFor(productId: string) {
  return productImages.filter((image) => image.productId === productId);
}

function productVariants(product: CatalogProduct): CatalogVariant[] {
  return [...(variantsByProduct.get(product.id) ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

function categoryWithDescendantIds(categoryId: string): Set<string> {
  const ids = new Set<string>([categoryId]);
  for (const category of categories) {
    if (category.parentId === categoryId) ids.add(category.id);
  }
  return ids;
}

function requireCategory(product: CatalogProduct): Category {
  const category = categoryById.get(product.categoryId);
  if (!category) throw new Error(`Producto ${product.slug} sin categoría válida`);
  return category;
}

function cardFor(
  product: CatalogProduct,
  displayFilter?: (variant: CatalogVariant) => boolean,
): ProductCardData {
  return toCardData({
    product,
    category: requireCategory(product),
    brand: product.brandId ? (brandById.get(product.brandId) ?? null) : null,
    variants: productVariants(product),
    images: imagesFor(product.id),
    displayFilter,
  });
}

function matchesQuery(product: CatalogProduct, query: string): boolean {
  const brand = product.brandId ? brandById.get(product.brandId) : undefined;
  const haystack = normalizeText(
    [product.name, brand?.name, requireCategory(product).name, product.shortDescription]
      .filter(Boolean)
      .join(" "),
  );
  return normalizeText(query)
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

function buildFacets(base: CatalogProduct[]): CatalogFacets {
  const brandCounts = new Map<string, number>();
  const conditionCounts = new Map<CatalogProduct["condition"], number>();
  const capacities = new Set<string>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const product of base) {
    if (product.brandId)
      brandCounts.set(product.brandId, (brandCounts.get(product.brandId) ?? 0) + 1);
    conditionCounts.set(product.condition, (conditionCounts.get(product.condition) ?? 0) + 1);
    for (const variant of productVariants(product)) {
      if (variant.capacity) capacities.add(variant.capacity);
      min = Math.min(min, variant.priceRetail);
      max = Math.max(max, variant.priceRetail);
    }
  }

  return {
    brands: [...brandCounts.entries()]
      .flatMap(([id, count]) => {
        const brand = brandById.get(id);
        return brand ? [{ slug: brand.slug, name: brand.name, count, order: brand.sortOrder }] : [];
      })
      .sort((a, b) => a.order - b.order)
      .map(({ slug, name, count }) => ({ slug, name, count })),
    conditions: [...conditionCounts.entries()].map(([value, count]) => ({ value, count })),
    capacities: [...capacities].sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    priceBounds: Number.isFinite(min) ? { min, max } : { min: 0, max: 0 },
  };
}

export async function getCategories(): Promise<Category[]> {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getTopLevelCategories(): Promise<Category[]> {
  return categories
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categoryBySlug.get(slug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  return [...brands].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getNavCategories(): Promise<NavCategory[]> {
  const topLevel = (await getTopLevelCategories()).slice(0, NAV_CATEGORY_LIMIT);

  return topLevel.map((category) => {
    const ids = categoryWithDescendantIds(category.id);
    const inCategory = products.filter((product) => ids.has(product.categoryId));
    const children = categories
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
    const navBrands = brands
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
      promo: siteSettings.navPromos[category.slug] ?? null,
    };
  });
}

export async function listProducts(filters: CatalogFilters): Promise<CatalogPage> {
  const categoryIds = filters.categorySlug
    ? categoryWithDescendantIds(categoryBySlug.get(filters.categorySlug)?.id ?? "")
    : null;

  const base = products.filter(
    (product) =>
      (categoryIds === null || categoryIds.has(product.categoryId)) &&
      (filters.query === null || matchesQuery(product, filters.query)),
  );

  const variantPasses = (variant: CatalogVariant): boolean =>
    (filters.capacities.length === 0 ||
      (variant.capacity !== null && filters.capacities.includes(variant.capacity))) &&
    (filters.priceMin === null || variant.priceRetail >= filters.priceMin) &&
    (filters.priceMax === null || variant.priceRetail <= filters.priceMax) &&
    (!filters.onlyInStock || variant.stock > 0);

  const brandSlugToId = new Map(brands.map((brand) => [brand.slug, brand.id]));
  const brandIds = new Set(
    filters.brandSlugs.flatMap((slug) => {
      const id = brandSlugToId.get(slug);
      return id ? [id] : [];
    }),
  );

  const filtered = base.filter(
    (product) =>
      (filters.brandSlugs.length === 0 ||
        (product.brandId !== null && brandIds.has(product.brandId))) &&
      (filters.conditions.length === 0 || filters.conditions.includes(product.condition)) &&
      productVariants(product).some(variantPasses),
  );

  const cards = filtered.map((product) => ({ product, card: cardFor(product, variantPasses) }));

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
    facets: buildFacets(base),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = productBySlug.get(slug);
  if (!product) return null;
  return {
    ...product,
    category: requireCategory(product),
    brand: product.brandId ? (brandById.get(product.brandId) ?? null) : null,
    variants: productVariants(product),
    images: imagesFor(product.id),
  };
}

export async function getAllProductSlugs(): Promise<string[]> {
  return products.map((product) => product.slug);
}

export async function getFeaturedProducts(limit: number): Promise<ProductCardData[]> {
  return products
    .filter((product) => product.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((product) => cardFor(product));
}

export async function getPromoProducts(limit: number): Promise<ProductCardData[]> {
  return products
    .map((product) => cardFor(product))
    .filter((card) => card.discountPercent !== null)
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    .slice(0, limit);
}

export async function getRelatedProducts(
  productId: string,
  limit: number,
): Promise<ProductCardData[]> {
  const current = products.find((product) => product.id === productId);
  if (!current) return [];
  return products
    .filter((product) => product.id !== current.id && product.categoryId === current.categoryId)
    .sort(
      (a, b) =>
        Number(b.brandId === current.brandId) - Number(a.brandId === current.brandId) ||
        a.sortOrder - b.sortOrder,
    )
    .slice(0, limit)
    .map((product) => cardFor(product));
}

export async function getServices(): Promise<Service[]> {
  return [...services].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return services.find((service) => service.slug === slug) ?? null;
}

async function fromPriceFor(href: string | null): Promise<number | null> {
  if (!href) return null;
  const productMatch = /^\/producto\/([a-z0-9-]+)$/.exec(href);
  if (productMatch?.[1]) {
    const product = productBySlug.get(productMatch[1]);
    return product ? cardFor(product).minPrice : null;
  }
  const categoryMatch = /^\/tienda\/([a-z0-9-]+)$/.exec(href);
  if (categoryMatch?.[1]) {
    const page = await listProducts({
      categorySlug: categoryMatch[1],
      brandSlugs: [],
      conditions: [],
      priceMin: null,
      priceMax: null,
      capacities: [],
      onlyInStock: false,
      query: null,
      sort: "precio-asc",
      limit: 1,
    });
    return page.items[0]?.minPrice ?? null;
  }
  return null;
}

export async function getBanners(): Promise<Banner[]> {
  const sorted = [...bannersBase].sort((a, b) => a.sortOrder - b.sortOrder);
  return Promise.all(
    sorted.map(async (banner) => ({ ...banner, fromPrice: await fromPriceFor(banner.ctaHref) })),
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

/** Filas de precios (con precio mayorista) para revalorizar en el servidor. */
export async function getPricingRows(variantIds: string[]): Promise<VariantPricingRow[]> {
  const wanted = new Set(variantIds);
  return variants
    .filter((variant) => wanted.has(variant.id))
    .flatMap((variant) => {
      const product = products.find((item) => item.id === variant.productId);
      if (!product) return [];
      const terms = getWholesaleTerms(variant.id);
      return [
        {
          variantId: variant.id,
          productName: product.name,
          productSlug: product.slug,
          variantLabel: variantLabel(variant),
          priceRetail: variant.priceRetail,
          priceWholesale: terms?.price ?? null,
          minWholesaleQty: terms?.minQty ?? 1,
          stock: variant.stock,
        },
      ];
    });
}
