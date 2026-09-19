import { describe, expect, it } from "vitest";
import type { Tables } from "@/types/database";
import { toImage, toProduct, toVariant } from "./mappers";

const productRow: Tables<"v_catalog_products"> = {
  id: "p1",
  slug: "iphone-15",
  name: "iPhone 15",
  short_description: null,
  description: null,
  category_id: "c1",
  brand_id: null,
  condition: "nuevo",
  specs: { Chip: "A16" },
  is_featured: false,
  warranty_note: null,
  sort_order: 1,
  created_at: "2026-08-01T12:00:00+00:00",
  updated_at: "2026-08-01T12:00:00+00:00",
};

const variantRow: Tables<"v_catalog_variants"> = {
  id: "v1",
  product_id: "p1",
  sku: null,
  capacity: "128 GB",
  color: null,
  color_hex: null,
  price_retail: 62900,
  compare_at_price: null,
  stock: 3,
  is_active: true,
  sort_order: 1,
};

describe("toProduct", () => {
  it("convierte la fila a la forma del dominio", () => {
    expect(toProduct(productRow)).toMatchObject({
      slug: "iphone-15",
      categoryId: "c1",
      specs: { Chip: "A16" },
      isFeatured: false,
    });
  });

  it("una ficha técnica mal formada queda vacía en vez de tumbar la tienda", () => {
    expect(toProduct({ ...productRow, specs: ["no", "es", "un", "objeto"] }).specs).toEqual({});
    expect(toProduct({ ...productRow, specs: { Chip: 16 } }).specs).toEqual({});
  });

  it("rechaza filas con columnas obligatorias en null (la vista declara todo nulable)", () => {
    expect(() => toProduct({ ...productRow, slug: null })).toThrow();
    expect(() => toProduct({ ...productRow, category_id: null })).toThrow();
  });
});

describe("toVariant", () => {
  it("nunca expone precio mayorista ni cantidad mínima", () => {
    const variant = toVariant(variantRow);
    expect(variant.priceRetail).toBe(62900);
    expect(Object.keys(variant)).not.toContain("priceWholesale");
    expect(Object.keys(variant)).not.toContain("minWholesaleQty");
  });

  it("rechaza una variante sin precio", () => {
    expect(() => toVariant({ ...variantRow, price_retail: null })).toThrow();
  });
});

describe("toImage", () => {
  const imageRow: Tables<"v_catalog_images"> = {
    id: "i1",
    product_id: "p1",
    variant_id: null,
    url: "https://x.supabase.co/storage/v1/object/public/products/a.webp",
    alt: null,
    sort_order: 1,
  };

  it("sin texto alternativo usa el nombre del producto", () => {
    expect(toImage(imageRow, "iPhone 15").alt).toBe("iPhone 15");
    expect(toImage({ ...imageRow, alt: "" }, "iPhone 15").alt).toBe("iPhone 15");
  });

  it("respeta el texto alternativo cuando existe", () => {
    expect(toImage({ ...imageRow, alt: "Vista frontal" }, "iPhone 15").alt).toBe("Vista frontal");
  });
});
