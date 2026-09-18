import type { CatalogVariant } from "@/types/catalog";

export type VariantDimension = "capacity" | "color";

export interface VariantOption {
  value: string;
  hex: string | null;
  /** Existe al menos una variante con esta opción. */
  exists: boolean;
  /** Existe al menos una variante con esta opción y con stock. */
  available: boolean;
}

function valueOf(variant: CatalogVariant, dimension: VariantDimension): string | null {
  return dimension === "capacity" ? variant.capacity : variant.color;
}

export function defaultVariant(variants: CatalogVariant[]): CatalogVariant | null {
  return variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null;
}

/**
 * Opciones de una dimensión. Una opción sin stock en ninguna variante se marca
 * como no disponible pero se sigue mostrando (deshabilitada).
 */
export function variantOptions(
  variants: CatalogVariant[],
  dimension: VariantDimension,
): VariantOption[] {
  const options = new Map<string, VariantOption>();
  for (const variant of variants) {
    const value = valueOf(variant, dimension);
    if (!value) continue;
    const existing = options.get(value);
    options.set(value, {
      value,
      hex: existing?.hex ?? (dimension === "color" ? variant.colorHex : null),
      exists: true,
      available: (existing?.available ?? false) || variant.stock > 0,
    });
  }
  return [...options.values()];
}

/**
 * Variante resultante de elegir `value` en una dimensión. Conserva la otra
 * dimensión si esa combinación existe con stock; si no, salta a la primera
 * variante con stock que tenga la opción elegida.
 */
export function selectOption(
  variants: CatalogVariant[],
  current: CatalogVariant,
  dimension: VariantDimension,
  value: string,
): CatalogVariant | null {
  const other: VariantDimension = dimension === "capacity" ? "color" : "capacity";
  const withOption = variants.filter((variant) => valueOf(variant, dimension) === value);

  return (
    withOption.find(
      (variant) => variant.stock > 0 && valueOf(variant, other) === valueOf(current, other),
    ) ??
    withOption.find((variant) => variant.stock > 0) ??
    null
  );
}
