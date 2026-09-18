import "server-only";
import type { CatalogProduct, CatalogVariant } from "@/types/catalog";
import { productSeeds } from "./product-seeds";

const BASE_DATE = Date.parse("2026-08-01T12:00:00Z");
const DAY_MS = 86_400_000;

export const products: CatalogProduct[] = productSeeds.map((seed, index) => ({
  id: `prod-${seed.slug}`,
  slug: seed.slug,
  name: seed.name,
  shortDescription: seed.short,
  description: seed.description,
  categoryId: seed.categoryId,
  brandId: seed.brandId,
  condition: seed.condition ?? "nuevo",
  specs: seed.specs,
  isFeatured: seed.featured ?? false,
  warrantyNote: seed.warranty ?? null,
  sortOrder: index + 1,
  createdAt: new Date(BASE_DATE - index * DAY_MS).toISOString(),
}));

/** Variantes en su forma pública: sin precio mayorista ni cantidad mínima. */
export const variants: CatalogVariant[] = productSeeds.flatMap((seed) =>
  seed.variants.map((variant, index) => ({
    id: `${seed.slug}-v${index + 1}`,
    productId: `prod-${seed.slug}`,
    sku: `RU-${seed.slug.toUpperCase()}-${index + 1}`,
    capacity: variant.capacity ?? null,
    color: variant.color ?? null,
    colorHex: variant.hex ?? null,
    priceRetail: variant.price,
    compareAtPrice: variant.compareAt ?? null,
    stock: variant.stock,
    sortOrder: index + 1,
  })),
);
