import { z } from "zod";
import { isAllowedImageUrl } from "@/lib/admin/image-url";
import { SLUG_PATTERN } from "@/lib/admin/slug";
import { Constants } from "@/types/database";
import { integer, money, nullableUuid, optionalMoney, optionalText } from "./common";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export const variantSchema = z
  .object({
    /** Presente si la variante ya existe; ausente al crearla. */
    id: z.uuid().optional(),
    sku: optionalText(60),
    capacity: optionalText(30),
    color: optionalText(40),
    colorHex: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined))
      .pipe(z.string().regex(HEX_COLOR, "Usa el formato #RRGGBB").optional()),
    priceRetail: money,
    priceWholesale: optionalMoney,
    compareAtPrice: optionalMoney,
    minWholesaleQty: integer(1, 100_000, "Ingresa un entero de 1 en adelante"),
    stock: integer(0, 1_000_000, "Ingresa un entero de 0 en adelante"),
    isActive: z.boolean(),
  })
  .superRefine((variant, ctx) => {
    if (variant.priceWholesale !== undefined && variant.priceWholesale > variant.priceRetail) {
      ctx.addIssue({
        code: "custom",
        path: ["priceWholesale"],
        message: "No puede superar el precio por unidad",
      });
    }
    if (variant.compareAtPrice !== undefined && variant.compareAtPrice <= variant.priceRetail) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "Debe ser mayor que el precio por unidad (es el precio tachado)",
      });
    }
  });

export const productSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2, "Ingresa el nombre").max(120, "Máximo 120 caracteres"),
    slug: z
      .string()
      .trim()
      .min(1, "Ingresa el slug")
      .max(80, "Máximo 80 caracteres")
      .regex(SLUG_PATTERN, "Solo minúsculas, números y guiones"),
    categoryId: z.uuid("Elige una categoría"),
    brandId: nullableUuid,
    condition: z.enum(Constants.public.Enums.product_condition),
    shortDescription: optionalText(200),
    description: optionalText(5000),
    warrantyNote: optionalText(300),
    specs: z
      .array(
        z.object({
          key: z.string().trim().min(1, "Falta el nombre").max(40, "Máximo 40 caracteres"),
          value: z.string().trim().min(1, "Falta el valor").max(120, "Máximo 120 caracteres"),
        }),
      )
      .max(20, "Máximo 20 especificaciones"),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    variants: z
      .array(variantSchema)
      .min(1, "Agrega al menos una variante")
      .max(30, "Máximo 30 variantes"),
  })
  .superRefine((product, ctx) => {
    const specKeys = new Set<string>();
    product.specs.forEach((spec, index) => {
      const key = spec.key.toLowerCase();
      if (specKeys.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["specs", index, "key"],
          message: "Nombre repetido",
        });
      }
      specKeys.add(key);
    });

    const seen = new Set<string>();
    product.variants.forEach((variant, index) => {
      if (!variant.sku) return;
      const key = variant.sku.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["variants", index, "sku"],
          message: "SKU repetido en este producto",
        });
      }
      seen.add(key);
    });
  });

export type ProductInput = z.input<typeof productSchema>;
export type ProductValues = z.output<typeof productSchema>;
export type VariantInput = z.input<typeof variantSchema>;

export const imageAltSchema = z
  .string()
  .trim()
  .min(3, "Describe la imagen (mín. 3 letras)")
  .max(160, "Máximo 160 caracteres");

export const imageInputSchema = z.object({
  url: z.url().max(500).refine(isAllowedImageUrl, "Imagen no permitida"),
  alt: imageAltSchema,
  variantId: nullableUuid,
});
