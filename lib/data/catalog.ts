import "server-only";
import type {
  Brand,
  CatalogFilters,
  CatalogPage,
  Category,
  ProductCardData,
  ProductDetail,
} from "@/types/catalog";
import type { NavCategory } from "@/types/site";
import {
  buildCatalogIndex,
  cardFor,
  categoryOf,
  productImages,
  productVariants,
  type CatalogIndex,
} from "./catalog-index";
import { listProducts as filterProducts } from "./catalog-list";
import { buildNavCategories } from "./nav";
import { getSiteSettings } from "./settings";
import { getCatalogSnapshot } from "./snapshot";

async function loadIndex(): Promise<CatalogIndex> {
  return buildCatalogIndex(await getCatalogSnapshot());
}

export async function getCategories(): Promise<Category[]> {
  const index = await loadIndex();
  return [...index.categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getTopLevelCategories(): Promise<Category[]> {
  return (await getCategories()).filter((category) => category.parentId === null);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return (await loadIndex()).categoryBySlug.get(slug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  const index = await loadIndex();
  return [...index.brands].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getNavCategories(): Promise<NavCategory[]> {
  const [index, settings] = await Promise.all([loadIndex(), getSiteSettings()]);
  return buildNavCategories(index, settings.navPromos);
}

export async function listProducts(filters: CatalogFilters): Promise<CatalogPage> {
  return filterProducts(await loadIndex(), filters);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const index = await loadIndex();
  const product = index.productBySlug.get(slug);
  if (!product) return null;
  return {
    ...product,
    category: categoryOf(index, product),
    brand: product.brandId ? (index.brandById.get(product.brandId) ?? null) : null,
    variants: productVariants(index, product),
    images: productImages(index, product),
  };
}

export async function getAllProductSlugs(): Promise<string[]> {
  return (await loadIndex()).products.map((product) => product.slug);
}

export async function getFeaturedProducts(limit: number): Promise<ProductCardData[]> {
  const index = await loadIndex();
  return index.products
    .filter((product) => product.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
    .map((product) => cardFor(index, product));
}

export async function getPromoProducts(limit: number): Promise<ProductCardData[]> {
  const index = await loadIndex();
  return index.products
    .map((product) => cardFor(index, product))
    .filter((card) => card.discountPercent !== null)
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    .slice(0, limit);
}

export async function getRelatedProducts(
  productId: string,
  limit: number,
): Promise<ProductCardData[]> {
  const index = await loadIndex();
  const current = index.products.find((product) => product.id === productId);
  if (!current) return [];
  return index.products
    .filter((product) => product.id !== current.id && product.categoryId === current.categoryId)
    .sort(
      (a, b) =>
        Number(b.brandId === current.brandId) - Number(a.brandId === current.brandId) ||
        a.sortOrder - b.sortOrder,
    )
    .slice(0, limit)
    .map((product) => cardFor(index, product));
}
