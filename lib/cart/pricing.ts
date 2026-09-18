import type { PriceTier } from "@/types/catalog";

/** Fila de precios tal como vive en el servidor: incluye el precio mayorista. */
export interface VariantPricingRow {
  variantId: string;
  productName: string;
  productSlug: string;
  variantLabel: string | null;
  priceRetail: number;
  priceWholesale: number | null;
  minWholesaleQty: number;
  stock: number;
}

export interface PricedLine {
  variantId: string;
  productName: string;
  productSlug: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  tierApplied: PriceTier;
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function assertValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError(`Cantidad inválida: ${quantity}`);
  }
}

/**
 * El precio mayorista solo aplica si el usuario es mayorista aprobado, la
 * variante tiene precio mayorista y la cantidad alcanza el mínimo. En cualquier
 * otro caso se cobra el precio de unidad.
 */
export function resolveUnitPrice(
  row: Pick<VariantPricingRow, "priceRetail" | "priceWholesale" | "minWholesaleQty">,
  tier: PriceTier,
  quantity: number,
): { unitPrice: number; tierApplied: PriceTier } {
  assertValidQuantity(quantity);

  if (tier === "wholesale" && row.priceWholesale !== null && quantity >= row.minWholesaleQty) {
    return { unitPrice: row.priceWholesale, tierApplied: "wholesale" };
  }
  return { unitPrice: row.priceRetail, tierApplied: "retail" };
}

export function priceLine(row: VariantPricingRow, tier: PriceTier, quantity: number): PricedLine {
  const { unitPrice, tierApplied } = resolveUnitPrice(row, tier, quantity);
  return {
    variantId: row.variantId,
    productName: row.productName,
    productSlug: row.productSlug,
    variantLabel: row.variantLabel,
    quantity,
    unitPrice,
    lineTotal: roundMoney(unitPrice * quantity),
    tierApplied,
  };
}

export function computeSubtotal(lines: Pick<PricedLine, "lineTotal">[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0));
}

/** Suma de lo que se ahorra frente al precio de unidad (solo líneas mayoristas). */
export function computeWholesaleSavings(
  lines: PricedLine[],
  rows: Map<string, VariantPricingRow>,
): number {
  return roundMoney(
    lines.reduce((sum, line) => {
      const row = rows.get(line.variantId);
      if (!row || line.tierApplied !== "wholesale") return sum;
      return sum + (row.priceRetail - line.unitPrice) * line.quantity;
    }, 0),
  );
}
