import { z } from "zod";
import type { ProductInput, VariantInput } from "@/lib/validation/admin/product";
import type { Tables } from "@/types/database";

const specsSchema = z.record(z.string(), z.string()).catch({});

export const EMPTY_VARIANT_INPUT: VariantInput = {
  capacity: "",
  color: "",
  colorHex: "",
  sku: "",
  priceRetail: "",
  priceWholesale: "",
  compareAtPrice: "",
  minWholesaleQty: "1",
  stock: "0",
  isActive: true,
};

export function emptyProductInput(): ProductInput {
  return {
    name: "",
    slug: "",
    categoryId: "",
    brandId: "",
    condition: "nuevo",
    shortDescription: "",
    description: "",
    warrantyNote: "",
    specs: [],
    isActive: false,
    isFeatured: false,
    variants: [EMPTY_VARIANT_INPUT],
  };
}

const text = (value: number | null) => (value === null ? "" : String(value));

/** Del registro de la base a los valores (texto) que edita el formulario. */
export function productToInput(
  product: Tables<"products">,
  variants: Tables<"product_variants">[],
): ProductInput {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id,
    brandId: product.brand_id ?? "",
    condition: product.condition,
    shortDescription: product.short_description ?? "",
    description: product.description ?? "",
    warrantyNote: product.warranty_note ?? "",
    specs: Object.entries(specsSchema.parse(product.specs)).map(([key, value]) => ({ key, value })),
    isActive: product.is_active,
    isFeatured: product.is_featured,
    variants: variants.map((variant) => ({
      id: variant.id,
      capacity: variant.capacity ?? "",
      color: variant.color ?? "",
      colorHex: variant.color_hex ?? "",
      sku: variant.sku ?? "",
      priceRetail: text(variant.price_retail),
      priceWholesale: text(variant.price_wholesale),
      compareAtPrice: text(variant.compare_at_price),
      minWholesaleQty: String(variant.min_wholesale_qty),
      stock: String(variant.stock),
      isActive: variant.is_active,
    })),
  };
}
