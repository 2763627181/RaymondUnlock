import "server-only";
import { productSeeds } from "./product-seeds";

export interface WholesaleTerms {
  price: number;
  minQty: number;
}

const WHOLESALE_RATIO = 0.9;

/** Precio mayorista ficticio: 10 % menos que la unidad, redondeado a decenas. */
const table = new Map<string, WholesaleTerms>(
  productSeeds.flatMap((seed) =>
    seed.variants.map((variant, index): [string, WholesaleTerms] => [
      `${seed.slug}-v${index + 1}`,
      {
        price: Math.round((variant.price * WHOLESALE_RATIO) / 10) * 10,
        minQty: seed.wholesaleMinQty,
      },
    ]),
  ),
);

export function getWholesaleTerms(variantId: string): WholesaleTerms | null {
  return table.get(variantId) ?? null;
}
