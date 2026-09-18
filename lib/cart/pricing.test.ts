import { describe, expect, it } from "vitest";
import {
  computeSubtotal,
  computeWholesaleSavings,
  priceLine,
  resolveUnitPrice,
  type VariantPricingRow,
} from "@/lib/cart/pricing";

const row: VariantPricingRow = {
  variantId: "v1",
  productName: "iPhone 15 Pro",
  productSlug: "iphone-15-pro",
  variantLabel: "128 GB · Titanio natural",
  priceRetail: 1000,
  priceWholesale: 900,
  minWholesaleQty: 3,
  stock: 10,
};

describe("resolveUnitPrice", () => {
  it("cobra precio de unidad a clientes retail aunque la variante tenga precio mayorista", () => {
    expect(resolveUnitPrice(row, "retail", 10)).toEqual({ unitPrice: 1000, tierApplied: "retail" });
  });

  it("aplica el precio mayorista al mayorista que alcanza la cantidad mínima", () => {
    expect(resolveUnitPrice(row, "wholesale", 3)).toEqual({
      unitPrice: 900,
      tierApplied: "wholesale",
    });
  });

  it("cobra precio de unidad al mayorista que no alcanza la cantidad mínima", () => {
    expect(resolveUnitPrice(row, "wholesale", 2)).toEqual({
      unitPrice: 1000,
      tierApplied: "retail",
    });
  });

  it("cobra precio de unidad si la variante no tiene precio mayorista", () => {
    expect(resolveUnitPrice({ ...row, priceWholesale: null }, "wholesale", 50)).toEqual({
      unitPrice: 1000,
      tierApplied: "retail",
    });
  });

  it.each([0, -1, 1.5, Number.NaN])("rechaza cantidades inválidas (%s)", (quantity) => {
    expect(() => resolveUnitPrice(row, "retail", quantity)).toThrow(RangeError);
  });
});

describe("priceLine y computeSubtotal", () => {
  it("calcula el total de la línea y el subtotal con redondeo a centavos", () => {
    const a = priceLine({ ...row, priceRetail: 10.1 }, "retail", 3);
    const b = priceLine({ ...row, variantId: "v2", priceRetail: 0.2 }, "retail", 1);

    expect(a.lineTotal).toBe(30.3);
    expect(computeSubtotal([a, b])).toBe(30.5);
  });

  it("devuelve subtotal 0 para un carrito vacío", () => {
    expect(computeSubtotal([])).toBe(0);
  });
});

describe("computeWholesaleSavings", () => {
  it("suma el ahorro solo de las líneas con precio mayorista", () => {
    const wholesaleLine = priceLine(row, "wholesale", 4);
    const retailRow = { ...row, variantId: "v2" };
    const retailLine = priceLine(retailRow, "wholesale", 1);
    const rows = new Map([
      [row.variantId, row],
      [retailRow.variantId, retailRow],
    ]);

    expect(computeWholesaleSavings([wholesaleLine, retailLine], rows)).toBe(400);
  });
});
