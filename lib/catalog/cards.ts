import type {
  Brand,
  CardColor,
  CatalogProduct,
  CatalogVariant,
  Category,
  ProductCardData,
  ProductImage,
} from "@/types/catalog";
import { UNLOCK_LABELS, formatBattery } from "@/lib/catalog/text";
import { discountPercent } from "@/lib/format";

const MAX_CARD_COLORS = 5;

/** "128 GB · Azul · Batería 92 % · Factory": lo que distingue a una variante de otra. */
export function variantLabel(
  variant: Pick<CatalogVariant, "capacity" | "color"> &
    Partial<Pick<CatalogVariant, "batteryHealth" | "unlockType">>,
): string | null {
  const parts = [
    variant.capacity,
    variant.color,
    variant.batteryHealth != null ? `Batería ${formatBattery(variant.batteryHealth)}` : null,
    variant.unlockType ? UNLOCK_LABELS[variant.unlockType] : null,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Si hay variantes con stock, el precio "desde" se calcula solo con ellas. */
export function pickDisplayVariants(variants: CatalogVariant[]): CatalogVariant[] {
  const inStock = variants.filter((variant) => variant.stock > 0);
  return inStock.length > 0 ? inStock : variants;
}

function uniqueColors(variants: CatalogVariant[]): CardColor[] {
  const seen = new Set<string>();
  const colors: CardColor[] = [];
  for (const variant of variants) {
    if (!variant.colorHex || !variant.color || seen.has(variant.colorHex)) continue;
    seen.add(variant.colorHex);
    colors.push({ name: variant.color, hex: variant.colorHex });
    if (colors.length === MAX_CARD_COLORS) break;
  }
  return colors;
}

export function toCardData(input: {
  product: CatalogProduct;
  category: Category;
  brand: Brand | null;
  variants: CatalogVariant[];
  images: ProductImage[];
  /** Restringe las variantes que se consideran para el precio mostrado. */
  displayFilter?: (variant: CatalogVariant) => boolean;
}): ProductCardData {
  const { product, category, brand, variants, images, displayFilter } = input;
  const considered = pickDisplayVariants(displayFilter ? variants.filter(displayFilter) : variants);
  const pool = considered.length > 0 ? considered : variants;

  const cheapest = pool.reduce((best, current) =>
    current.priceRetail < best.priceRetail ? current : best,
  );
  const compareAtPrice =
    cheapest.compareAtPrice !== null && cheapest.compareAtPrice > cheapest.priceRetail
      ? cheapest.compareAtPrice
      : null;
  const image = [...images].sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null;
  const onlyVariant = variants.length === 1 ? variants[0] : undefined;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: brand?.name ?? null,
    categorySlug: category.slug,
    categoryIcon: category.icon,
    condition: product.condition,
    minPrice: cheapest.priceRetail,
    maxPrice: Math.max(...pool.map((variant) => variant.priceRetail)),
    compareAtPrice,
    discountPercent: discountPercent(compareAtPrice, cheapest.priceRetail),
    inStock: variants.some((variant) => variant.stock > 0),
    imageUrl: image?.url ?? null,
    imageAlt: image?.alt || product.name,
    colors: uniqueColors(variants),
    variantCount: variants.length,
    quickAddVariantId: onlyVariant && onlyVariant.stock > 0 ? onlyVariant.id : null,
    quickAddLabel: onlyVariant ? variantLabel(onlyVariant) : null,
  };
}
