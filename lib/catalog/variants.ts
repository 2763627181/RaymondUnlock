import type { CatalogVariant } from "@/types/catalog";

/** Lo que el cliente puede elegir. "unlock" es factory/por artista y "battery" la salud de la batería. */
export type VariantDimension = "capacity" | "color" | "unlock" | "battery";

const DIMENSIONS: readonly VariantDimension[] = ["capacity", "color", "unlock", "battery"];

export interface VariantOption {
  value: string;
  hex: string | null;
  /** Existe al menos una variante con esta opción. */
  exists: boolean;
  /** Existe al menos una variante con esta opción y con stock. */
  available: boolean;
}

function valueOf(variant: CatalogVariant, dimension: VariantDimension): string | null {
  switch (dimension) {
    case "capacity":
      return variant.capacity;
    case "color":
      return variant.color;
    case "unlock":
      return variant.unlockType;
    case "battery":
      return variant.batteryHealth === null ? null : String(variant.batteryHealth);
  }
}

export function defaultVariant(variants: CatalogVariant[]): CatalogVariant | null {
  return variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null;
}

/**
 * Opciones de una dimensión. Una opción sin stock en ninguna variante se marca
 * como no disponible pero se sigue mostrando (deshabilitada). La batería va de
 * mayor a menor porque es la que más importa.
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
  const list = [...options.values()];
  return dimension === "battery" ? list.sort((a, b) => Number(b.value) - Number(a.value)) : list;
}

/**
 * Variante resultante de elegir `value` en una dimensión: entre las que tienen
 * esa opción y stock, la más parecida a la selección actual (la que conserva más
 * de las otras dimensiones). Con empate, la primera.
 */
export function selectOption(
  variants: CatalogVariant[],
  current: CatalogVariant,
  dimension: VariantDimension,
  value: string,
): CatalogVariant | null {
  const others = DIMENSIONS.filter((other) => other !== dimension);
  let best: CatalogVariant | null = null;
  let bestScore = -1;

  for (const variant of variants) {
    if (valueOf(variant, dimension) !== value || variant.stock <= 0) continue;
    const score = others.filter(
      (other) => valueOf(variant, other) === valueOf(current, other),
    ).length;
    if (score > bestScore) {
      best = variant;
      bestScore = score;
    }
  }
  return best;
}
