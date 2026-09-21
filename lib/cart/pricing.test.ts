import { describe, expect, it } from "vitest";
import { computeSubtotal, priceLine, type VariantPricingRow } from "@/lib/cart/pricing";

const row: VariantPricingRow = {
  variantId: "v1",
  productName: "iPhone 15 Pro",
  productSlug: "iphone-15-pro",
  variantLabel: "128 GB · Titanio natural",
  condition: "nuevo",
  code: "RU-00001",
  priceRetail: 1000,
  stock: 10,
};

describe("priceLine", () => {
  it("cobra siempre el precio por unidad", () => {
    expect(priceLine(row, 10)).toMatchObject({ unitPrice: 1000, lineTotal: 10000, quantity: 10 });
  });

  it("conserva estado y código para el mensaje y el admin", () => {
    expect(priceLine({ ...row, condition: "usado" }, 1)).toMatchObject({
      condition: "usado",
      code: "RU-00001",
    });
  });

  it.each([0, -1, 1.5, Number.NaN])("rechaza cantidades inválidas (%s)", (quantity) => {
    expect(() => priceLine(row, quantity)).toThrow(RangeError);
  });
});

describe("computeSubtotal", () => {
  it("suma las líneas con redondeo a centavos", () => {
    const a = priceLine({ ...row, priceRetail: 10.1 }, 3);
    const b = priceLine({ ...row, variantId: "v2", priceRetail: 0.2 }, 1);

    expect(a.lineTotal).toBe(30.3);
    expect(computeSubtotal([a, b])).toBe(30.5);
  });

  it("devuelve subtotal 0 para un carrito vacío", () => {
    expect(computeSubtotal([])).toBe(0);
  });
});
