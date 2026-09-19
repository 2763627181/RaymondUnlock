import { describe, expect, it } from "vitest";
import { priceCartForDisplay } from "./display-pricing";
import type { CartItem } from "./store";

function item(variantId: string, unitPrice: number, quantity: number): CartItem {
  return {
    variantId,
    quantity,
    snapshot: {
      productName: variantId,
      productSlug: variantId,
      variantLabel: null,
      unitPrice,
      imageUrl: null,
      icon: null,
      colorHex: null,
    },
  };
}

const terms = { a: { price: 900, minQty: 3 }, b: { price: 90, minQty: 1 } };

describe("priceCartForDisplay", () => {
  it("sin condiciones al por mayor todo va a precio por unidad", () => {
    const { lines, subtotal } = priceCartForDisplay([item("a", 1000, 5)], null);
    expect(lines.get("a")).toMatchObject({ unitPrice: 1000, tierApplied: "retail", terms: null });
    expect(subtotal).toBe(5000);
  });

  it("aplica el precio al por mayor solo al alcanzar la cantidad mínima", () => {
    const below = priceCartForDisplay([item("a", 1000, 2)], terms);
    expect(below.lines.get("a")).toMatchObject({ unitPrice: 1000, tierApplied: "retail" });
    expect(below.lines.get("a")?.terms).toEqual({ price: 900, minQty: 3 });

    const reached = priceCartForDisplay([item("a", 1000, 3)], terms);
    expect(reached.lines.get("a")).toMatchObject({ unitPrice: 900, tierApplied: "wholesale" });
    expect(reached.subtotal).toBe(2700);
  });

  it("una variante sin precio al por mayor queda a precio por unidad", () => {
    const { lines } = priceCartForDisplay([item("z", 500, 10)], terms);
    expect(lines.get("z")).toMatchObject({ unitPrice: 500, tierApplied: "retail" });
  });

  it("suma líneas con distinto tier", () => {
    const { subtotal } = priceCartForDisplay([item("a", 1000, 3), item("b", 100, 1)], terms);
    expect(subtotal).toBe(2700 + 90);
  });
});
