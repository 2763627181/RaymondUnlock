import { describe, expect, it } from "vitest";
import { defaultVariant, selectOption, variantOptions } from "@/lib/catalog/variants";
import type { CatalogVariant } from "@/types/catalog";

function variant(
  id: string,
  capacity: string | null,
  color: string | null,
  stock: number,
): CatalogVariant {
  return {
    id,
    productId: "p",
    sku: null,
    capacity,
    color,
    colorHex: color ? `#${id}` : null,
    priceRetail: 100,
    compareAtPrice: null,
    stock,
    sortOrder: 1,
  };
}

const variants = [
  variant("a", "128 GB", "Natural", 6),
  variant("b", "256 GB", "Natural", 4),
  variant("c", "256 GB", "Azul", 0),
  variant("d", "512 GB", "Negro", 2),
];

describe("defaultVariant", () => {
  it("elige la primera variante con stock", () => {
    expect(defaultVariant([variant("x", "1", "A", 0), variant("y", "2", "A", 3)])?.id).toBe("y");
  });

  it("si todo está agotado, devuelve la primera", () => {
    expect(defaultVariant([variant("x", "1", "A", 0)])?.id).toBe("x");
  });

  it("devuelve null sin variantes", () => {
    expect(defaultVariant([])).toBeNull();
  });
});

describe("variantOptions", () => {
  it("lista las capacidades en orden y marca disponibilidad", () => {
    expect(variantOptions(variants, "capacity").map((o) => [o.value, o.available])).toEqual([
      ["128 GB", true],
      ["256 GB", true],
      ["512 GB", true],
    ]);
  });

  it("muestra deshabilitado (no oculta) el color sin stock", () => {
    const azul = variantOptions(variants, "color").find((o) => o.value === "Azul");
    expect(azul).toMatchObject({ exists: true, available: false });
  });
});

describe("selectOption", () => {
  const [a, b, , d] = variants;

  it("conserva el color si esa combinación existe con stock", () => {
    expect(a && selectOption(variants, a, "capacity", "256 GB")?.id).toBe("b");
  });

  it("salta a la primera variante con stock cuando la combinación no existe", () => {
    expect(a && selectOption(variants, a, "capacity", "512 GB")?.id).toBe("d");
  });

  it("no permite elegir una opción sin stock", () => {
    expect(b && selectOption(variants, b, "color", "Azul")).toBeNull();
  });

  it("cambia de color conservando la capacidad cuando se puede", () => {
    expect(d && selectOption(variants, d, "color", "Natural")?.id).toBe("a");
  });
});
