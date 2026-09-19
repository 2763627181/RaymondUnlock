import { z } from "zod";
import type {
  Brand,
  CatalogProduct,
  CatalogVariant,
  Category,
  ProductImage,
} from "@/types/catalog";
import { Constants, type Tables } from "@/types/database";

/**
 * PostgREST declara TODAS las columnas de una vista como nulables, aunque no lo
 * sean. Estos esquemas validan cada fila al leerla y devuelven tipos sin null
 * (sin aserciones `!`); si la vista cambia de forma, falla fuerte y con mensaje.
 */

// Es jsonb editable desde el admin: una ficha mal formada no debe tumbar la tienda.
const specsSchema = z.record(z.string(), z.string()).catch({});

const productRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  category_id: z.string(),
  brand_id: z.string().nullable(),
  condition: z.enum(Constants.public.Enums.product_condition),
  specs: specsSchema,
  is_featured: z.boolean(),
  warranty_note: z.string().nullable(),
  sort_order: z.number().int(),
  created_at: z.string(),
});

const variantRowSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  sku: z.string().nullable(),
  capacity: z.string().nullable(),
  color: z.string().nullable(),
  color_hex: z.string().nullable(),
  price_retail: z.number(),
  compare_at_price: z.number().nullable(),
  stock: z.number().int(),
  sort_order: z.number().int(),
});

const imageRowSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable(),
  url: z.string(),
  alt: z.string().nullable(),
  sort_order: z.number().int(),
});

export function toCategory(row: Tables<"categories">): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    imageUrl: row.image_url,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
  };
}

export function toBrand(row: Tables<"brands">): Brand {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    sortOrder: row.sort_order,
  };
}

export function toProduct(row: Tables<"v_catalog_products">): CatalogProduct {
  const parsed = productRowSchema.parse(row);
  return {
    id: parsed.id,
    slug: parsed.slug,
    name: parsed.name,
    shortDescription: parsed.short_description,
    description: parsed.description,
    categoryId: parsed.category_id,
    brandId: parsed.brand_id,
    condition: parsed.condition,
    specs: parsed.specs,
    isFeatured: parsed.is_featured,
    warrantyNote: parsed.warranty_note,
    sortOrder: parsed.sort_order,
    createdAt: parsed.created_at,
  };
}

/** Forma pública de la variante: la vista no trae precio mayorista ni cantidad mínima. */
export function toVariant(row: Tables<"v_catalog_variants">): CatalogVariant {
  const parsed = variantRowSchema.parse(row);
  return {
    id: parsed.id,
    productId: parsed.product_id,
    sku: parsed.sku,
    capacity: parsed.capacity,
    color: parsed.color,
    colorHex: parsed.color_hex,
    priceRetail: parsed.price_retail,
    compareAtPrice: parsed.compare_at_price,
    stock: parsed.stock,
    sortOrder: parsed.sort_order,
  };
}

export function toImage(row: Tables<"v_catalog_images">, fallbackAlt: string): ProductImage {
  const parsed = imageRowSchema.parse(row);
  return {
    id: parsed.id,
    productId: parsed.product_id,
    variantId: parsed.variant_id,
    url: parsed.url,
    alt: parsed.alt || fallbackAlt,
    sortOrder: parsed.sort_order,
  };
}
