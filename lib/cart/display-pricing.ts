import { resolveUnitPrice } from "@/lib/cart/pricing";
import type { CartItem } from "@/lib/cart/store";
import type { PriceTier } from "@/types/catalog";

export interface DisplayTerms {
  price: number;
  minQty: number;
}

export interface DisplayLine {
  unitPrice: number;
  lineTotal: number;
  tierApplied: PriceTier;
  /** Condiciones al por mayor de la variante, si el visitante puede verlas. */
  terms: DisplayTerms | null;
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Precios que se muestran en el carrito. Es solo visualización: el servidor
 * vuelve a calcular todo al enviar la cotización. `terms` es null para quien
 * no es mayorista aprobado, y entonces todo se cobra a precio por unidad.
 */
export function priceCartForDisplay(
  items: CartItem[],
  terms: Record<string, DisplayTerms> | null,
): { lines: Map<string, DisplayLine>; subtotal: number } {
  const lines = new Map<string, DisplayLine>();
  let subtotal = 0;

  for (const item of items) {
    const lineTerms = terms?.[item.variantId] ?? null;
    const { unitPrice, tierApplied } = resolveUnitPrice(
      {
        priceRetail: item.snapshot.unitPrice,
        priceWholesale: lineTerms?.price ?? null,
        minWholesaleQty: lineTerms?.minQty ?? 1,
      },
      terms ? "wholesale" : "retail",
      item.quantity,
    );
    const lineTotal = roundMoney(unitPrice * item.quantity);
    subtotal += lineTotal;
    lines.set(item.variantId, { unitPrice, lineTotal, tierApplied, terms: lineTerms });
  }

  return { lines, subtotal: roundMoney(subtotal) };
}
