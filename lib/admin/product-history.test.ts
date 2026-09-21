import { describe, expect, it } from "vitest";
import { describeHistory, type HistoryRow } from "@/lib/admin/product-history";

const lookups = {
  categories: new Map([["c1", "Celulares"]]),
  brands: new Map([["b1", "Apple"]]),
};

function row(overrides: Partial<HistoryRow>): HistoryRow {
  return {
    id: 1,
    entity: "variant",
    action: "update",
    old_data: null,
    new_data: null,
    changed_at: "2026-09-20T15:30:00+00:00",
    ...overrides,
  };
}

const variant = {
  id: "v1",
  product_id: "p1",
  sku: "RU-00012",
  capacity: "128 GB",
  color: "Azul",
  battery_health: 92,
  unlock_type: "factory",
  price_retail: 32500,
  price_wholesale: 30000,
  stock: 2,
  is_active: true,
  sort_order: 1,
  updated_at: "2026-09-20T10:00:00+00:00",
};

describe("describeHistory", () => {
  it("una modificación muestra cada campo con su valor antes y después", () => {
    const [entry] = describeHistory(
      [
        row({
          old_data: variant,
          new_data: { ...variant, price_retail: 34000, battery_health: 90, unlock_type: "artista" },
        }),
      ],
      lookups,
    );

    expect(entry?.title).toBe(
      "Variante 128 GB · Azul · Batería 90 % · Por artista (RU-00012) modificada",
    );
    expect(entry?.changes).toEqual([
      { label: "Batería", before: "92 %", after: "90 %" },
      { label: "Liberación", before: "Factory", after: "Por artista" },
      { label: "Precio por unidad", before: "RD$ 32,500.00", after: "RD$ 34,000.00" },
    ]);
  });

  it("ignora lo que la base mueve sola (fecha, orden) y omite entradas sin cambios visibles", () => {
    const entries = describeHistory(
      [
        row({
          old_data: variant,
          new_data: { ...variant, updated_at: "2027-01-01T00:00:00+00:00", sort_order: 9 },
        }),
      ],
      lookups,
    );
    expect(entries).toEqual([]);
  });

  it("crear y eliminar nombran el objeto y no listan campos", () => {
    const [created, deleted] = describeHistory(
      [
        row({ id: 2, action: "create", old_data: null, new_data: variant }),
        row({ id: 3, action: "delete", old_data: variant, new_data: null }),
      ],
      lookups,
    );
    expect(created).toMatchObject({ action: "create", changes: [] });
    expect(created?.title).toContain("agregada");
    expect(deleted?.title).toContain("eliminada");
    expect(deleted?.title).toContain("RU-00012");
  });

  it("del producto: categoría y marca salen por nombre, no por id; booleanos como Sí/No", () => {
    const product = {
      id: "p1",
      name: "iPhone 13",
      category_id: "c1",
      brand_id: null,
      is_active: false,
      condition: "usado",
    };
    const [entry] = describeHistory(
      [
        row({
          entity: "product",
          old_data: product,
          new_data: {
            ...product,
            brand_id: "b1",
            is_active: true,
            condition: "nuevo",
            name: "iPhone 13 128 GB",
          },
        }),
      ],
      lookups,
    );
    expect(entry?.title).toBe("Producto modificado");
    expect(entry?.changes).toEqual([
      { label: "Nombre", before: "iPhone 13", after: "iPhone 13 128 GB" },
      { label: "Marca", before: "—", after: "Apple" },
      { label: "Estado", before: "Usado", after: "Nuevo" },
      { label: "Activo", before: "No", after: "Sí" },
    ]);
  });

  it("no se rompe con datos inesperados (jsonb nulo o de otra forma)", () => {
    expect(describeHistory([row({ action: "create", new_data: null })], lookups)).toHaveLength(1);
    expect(describeHistory([row({ old_data: [1, 2], new_data: "x" })], lookups)).toEqual([]);
  });

  it("una categoría que ya no existe no muestra el uuid", () => {
    const [entry] = describeHistory(
      [
        row({
          entity: "product",
          old_data: { category_id: "c1" },
          new_data: { category_id: "zzz" },
        }),
      ],
      lookups,
    );
    expect(entry?.changes[0]).toEqual({
      label: "Categoría",
      before: "Celulares",
      after: "Categoría eliminada",
    });
  });
});
