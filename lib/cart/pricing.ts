import type { ProductCondition } from "@/types/catalog";

/** Fila de una variante tal como la lee el servidor para recalcular una cotización. */
export interface VariantPricingRow {
  variantId: string;
  productName: string;
  productSlug: string;
  /** "128 GB · Azul · Batería 92 % · Factory". */
  variantLabel: string | null;
  condition: ProductCondition;
  /** SKU de la variante: el código con el que el cliente pide el equipo y el admin lo busca. */
  code: string | null;
  priceRetail: number;
  stock: number;
}

export interface PricedLine {
  variantId: string;
  productName: string;
  productSlug: string;
  variantLabel: string | null;
  condition: ProductCondition;
  code: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function priceLine(row: VariantPricingRow, quantity: number): PricedLine {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError(`Cantidad inválida: ${quantity}`);
  }
  return {
    variantId: row.variantId,
    productName: row.productName,
    productSlug: row.productSlug,
    variantLabel: row.variantLabel,
    condition: row.condition,
    code: row.code,
    quantity,
    unitPrice: row.priceRetail,
    lineTotal: roundMoney(row.priceRetail * quantity),
  };
}

export function computeSubtotal(lines: Pick<PricedLine, "lineTotal">[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0));
}
