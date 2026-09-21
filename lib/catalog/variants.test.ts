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
    batteryHealth: null,
    unlockType: null,
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

describe("equipos que solo se distinguen por batería y liberación", () => {
  function unit(
    id: string,
    capacity: string,
    batteryHealth: number,
    unlockType: CatalogVariant["unlockType"],
    stock = 1,
  ): CatalogVariant {
    return { ...variant(id, capacity, "Azul", stock), batteryHealth, unlockType };
  }

  const units = [
    unit("u1", "128 GB", 92, "factory"),
    unit("u2", "128 GB", 85, "artista"),
    unit("u3", "256 GB", 90, "factory"),
  ];
  const [u1, u2] = units;

  it("lista la liberación y la batería (de mayor a menor)", () => {
    expect(variantOptions(units, "unlock").map((o) => o.value)).toEqual(["factory", "artista"]);
    expect(variantOptions(units, "battery").map((o) => o.value)).toEqual(["92", "90", "85"]);
  });

  it("no ofrece opciones de una dimensión que ninguna variante tiene", () => {
    expect(variantOptions(variants, "unlock")).toEqual([]);
    expect(variantOptions(variants, "battery")).toEqual([]);
  });

  it("elegir liberación conserva la capacidad y el resto", () => {
    expect(u1 && selectOption(units, u1, "unlock", "artista")?.id).toBe("u2");
  });

  it("elegir una capacidad salta a la unidad que la tiene", () => {
    expect(u2 && selectOption(units, u2, "capacity", "256 GB")?.id).toBe("u3");
  });

  it("no se puede elegir la unidad agotada", () => {
    const sold = [unit("s1", "128 GB", 92, "factory"), unit("s2", "128 GB", 85, "artista", 0)];
    const [first] = sold;
    expect(first && selectOption(sold, first, "battery", "85")).toBeNull();
  });
});
