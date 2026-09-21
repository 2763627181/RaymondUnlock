import { beforeEach, describe, expect, it } from "vitest";
import { wholesaleOrderSchema } from "@/lib/validation/wholesale";
import { lineTotal, useWholesaleCart, wholesaleCount, wholesaleTotal } from "@/lib/wholesale/cart";
import {
  activeFilterCount,
  facetsOf,
  filterItems,
  groupByCategory,
  hasActiveSearch,
} from "@/lib/wholesale/filter";
import { formatCount, formatListingDate, formatWhatsappNumber } from "@/lib/wholesale/format";
import {
  WHOLESALE_MESSAGE_MAX,
  buildWholesaleMessage,
  buildWholesaleUrl,
  type WholesaleMessageInput,
} from "@/lib/wholesale/message";
import { EMPTY_FILTERS, type WholesaleItem } from "@/lib/wholesale/types";

function item(n: number, overrides: Partial<WholesaleItem> = {}): WholesaleItem {
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    name: `Producto ${n}`,
    type: "Celulares",
    category: "M-HORSE",
    condition: "NUEVO",
    price: 1000,
    imageUrl: null,
    sortOrder: n,
    ...overrides,
  };
}

const items = [
  item(1, { name: "M-Horse S26 Ultra Max 4G 4Gb/64Gb", price: 5100 }),
  item(2, { name: "M-Horse Note 14 Pro Plus", condition: "GRADO A" }),
  item(3, { name: "Oukitel C36", category: "OUKITEL" }),
  item(4, { name: "Batería original iPhone 13", type: "Accesorios", category: "BATERIAS" }),
  item(5, { name: "Pantalla Samsung A54", type: "Reparaciones", category: "PANTALLAS" }),
];

describe("filtros del listado", () => {
  it("sin filtros devuelve todo", () => {
    expect(filterItems(items, EMPTY_FILTERS)).toHaveLength(5);
  });

  it("busca por cualquier palabra, sin acentos ni mayúsculas, y todas deben aparecer", () => {
    const find = (query: string) =>
      filterItems(items, { ...EMPTY_FILTERS, query }).map((i) => i.id);
    expect(find("bateria iphone")).toEqual([items[3]?.id]);
    expect(find("  SAMSUNG  ")).toEqual([items[4]?.id]);
    expect(find("horse grado")).toEqual([items[1]?.id]);
    expect(find("oukitel c36 nuevo")).toEqual([items[2]?.id]);
    expect(find("inexistente")).toEqual([]);
  });

  it("combina tipo, categoría y condición (varias opciones del mismo grupo suman)", () => {
    expect(
      filterItems(items, { ...EMPTY_FILTERS, types: ["Accesorios", "Reparaciones"] }),
    ).toHaveLength(2);
    expect(
      filterItems(items, { ...EMPTY_FILTERS, categories: ["M-HORSE"], conditions: ["GRADO A"] }),
    ).toHaveLength(1);
    expect(
      filterItems(items, { ...EMPTY_FILTERS, types: ["Celulares"], categories: ["PANTALLAS"] }),
    ).toEqual([]);
  });

  it("agrupa por categoría en el orden en que aparecen", () => {
    expect(groupByCategory(items).map((group) => [group.category, group.items.length])).toEqual([
      ["M-HORSE", 2],
      ["OUKITEL", 1],
      ["BATERIAS", 1],
      ["PANTALLAS", 1],
    ]);
  });

  it("las opciones de los filtros salen de la lista, sin repetir", () => {
    expect(facetsOf(items)).toEqual({
      types: ["Celulares", "Accesorios", "Reparaciones"],
      categories: ["M-HORSE", "OUKITEL", "BATERIAS", "PANTALLAS"],
      conditions: ["NUEVO", "GRADO A"],
    });
  });

  it("cuenta grupos de filtro activos; la búsqueda por texto cuenta aparte", () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...EMPTY_FILTERS, types: ["A"], conditions: ["B", "C"] })).toBe(2);
    expect(hasActiveSearch({ ...EMPTY_FILTERS, query: "  " })).toBe(false);
    expect(hasActiveSearch({ ...EMPTY_FILTERS, query: "x" })).toBe(true);
    expect(hasActiveSearch({ ...EMPTY_FILTERS, categories: ["M-HORSE"] })).toBe(true);
  });
});

describe("mensaje del pedido por WhatsApp", () => {
  const base: WholesaleMessageInput = {
    code: "PM-2026-0001",
    lines: [
      {
        name: "M-Horse S26 Ultra Max 4G 4Gb/64Gb",
        condition: "NUEVO",
        quantity: 2,
        unitPrice: 5100,
        lineTotal: 10200,
      },
      { name: "Cable USB-C", condition: null, quantity: 10, unitPrice: 150, lineTotal: 1500 },
    ],
    total: 11700,
    siteHost: "raymondunlock.com",
  };

  it("lista cada producto con cantidad y precio, el total y el código del pedido", () => {
    expect(buildWholesaleMessage(base)).toBe(
      [
        "Hola, quiero hacer este pedido al por mayor:",
        "",
        "1) M-Horse S26 Ultra Max 4G 4Gb/64Gb (NUEVO)",
        "   2 × RD$ 5,100.00 = RD$ 10,200.00",
        "",
        "2) Cable USB-C",
        "   10 × RD$ 150.00 = RD$ 1,500.00",
        "",
        "*Total:* RD$ 11,700.00",
        "",
        "Pedido PM-2026-0001 · enviado desde raymondunlock.com",
      ].join("\n"),
    );
  });

  it("un pedido enorme se recorta y avisa cuántos faltan", () => {
    const many = Array.from({ length: 80 }, (_, index) => ({
      name: `Producto de nombre bastante largo número ${index + 1}`,
      condition: "GRADO A EN CAJA",
      quantity: 3,
      unitPrice: 1234.5,
      lineTotal: 3703.5,
    }));
    const message = buildWholesaleMessage({ ...base, lines: many, total: 296280 });
    expect(message.length).toBeLessThanOrEqual(WHOLESALE_MESSAGE_MAX);
    expect(message).toMatch(/\.\.\. y \d+ productos más — ver pedido PM-2026-0001/);
    expect(message).toContain("*Total:* RD$ 296,280.00");
  });

  it("la URL codifica saltos de línea y apunta al número elegido", () => {
    const url = buildWholesaleUrl("18097123062", base);
    expect(url.startsWith("https://wa.me/18097123062?text=")).toBe(true);
    expect(url).toContain("%0A");
    expect(decodeURIComponent(url.split("?text=")[1] ?? "")).toBe(buildWholesaleMessage(base));
  });
});

describe("pedido en el navegador", () => {
  beforeEach(() => {
    useWholesaleCart.setState({ lines: [] });
  });

  it("agrega, suma cantidades, cambia y quita líneas", () => {
    const { add, setQuantity, remove } = useWholesaleCart.getState();
    add(items[0] as WholesaleItem);
    add(items[0] as WholesaleItem);
    add(items[2] as WholesaleItem);
    expect(
      useWholesaleCart.getState().lines.map((line) => [line.snapshot.name, line.quantity]),
    ).toEqual([
      ["M-Horse S26 Ultra Max 4G 4Gb/64Gb", 2],
      ["Oukitel C36", 1],
    ]);
    setQuantity(items[2]?.id as string, 5);
    setQuantity(items[0]?.id as string, 100000);
    remove(items[0]?.id as string);
    expect(useWholesaleCart.getState().lines.map((line) => line.quantity)).toEqual([5]);
  });

  it("calcula unidades y total redondeando a centavos", () => {
    useWholesaleCart.setState({
      lines: [
        {
          id: "a",
          quantity: 3,
          snapshot: { name: "A", condition: "N", price: 10.1, imageUrl: null },
        },
        {
          id: "b",
          quantity: 1,
          snapshot: { name: "B", condition: "N", price: 0.2, imageUrl: null },
        },
      ],
    });
    const { lines } = useWholesaleCart.getState();
    expect(lineTotal(lines[0] as (typeof lines)[number])).toBe(30.3);
    expect(wholesaleCount(lines)).toBe(4);
    expect(wholesaleTotal(lines)).toBe(30.5);
  });

  it("sync deja precios al día y quita lo que ya no está en la lista", () => {
    const { add, sync } = useWholesaleCart.getState();
    add(items[0] as WholesaleItem);
    add(items[2] as WholesaleItem);
    sync([{ ...(items[0] as WholesaleItem), price: 4900 }]);
    expect(useWholesaleCart.getState().lines).toHaveLength(1);
    expect(useWholesaleCart.getState().lines[0]?.snapshot.price).toBe(4900);
  });
});

describe("wholesaleOrderSchema", () => {
  const id = "00000000-0000-4000-8000-000000000001";

  it("acepta ids y cantidades, y ningún precio", () => {
    const parsed = wholesaleOrderSchema.parse({
      items: [{ productId: id, quantity: 3 }],
      contactId: null,
    });
    expect(parsed).toEqual({ items: [{ productId: id, quantity: 3 }], contactId: null });
    expect(JSON.stringify(parsed)).not.toContain("price");
  });

  it("rechaza pedido vacío, ids raros, cantidades fuera de rango y demasiadas líneas", () => {
    expect(wholesaleOrderSchema.safeParse({ items: [], contactId: null }).success).toBe(false);
    expect(
      wholesaleOrderSchema.safeParse({ items: [{ productId: "x", quantity: 1 }], contactId: null })
        .success,
    ).toBe(false);
    for (const quantity of [0, -1, 1.5, 1000]) {
      expect(
        wholesaleOrderSchema.safeParse({ items: [{ productId: id, quantity }], contactId: null })
          .success,
      ).toBe(false);
    }
    const tooMany = Array.from({ length: 101 }, () => ({ productId: id, quantity: 1 }));
    expect(wholesaleOrderSchema.safeParse({ items: tooMany, contactId: null }).success).toBe(false);
    expect(
      wholesaleOrderSchema.safeParse({
        items: [{ productId: id, quantity: 1 }],
        contactId: "no-es-uuid",
      }).success,
    ).toBe(false);
  });
});

describe("formatos del listado", () => {
  it("escribe el número de WhatsApp como se lee en RD", () => {
    expect(formatWhatsappNumber("18097123062")).toBe("+1 (809) 712-3062");
    expect(formatWhatsappNumber("18298838858")).toBe("+1 (829) 883-8858");
    expect(formatWhatsappNumber("5491155550000")).toBe("+5491155550000");
  });

  it("la fecha sale en español y en hora de Santo Domingo", () => {
    // 13:50 UTC = 9:50 a. m. en Santo Domingo
    expect(formatListingDate("2026-09-19T13:50:00Z")).toBe("19 de septiembre de 2026, 9:50 a. m.");
  });

  it("la fecha distingue mañana, tarde, mediodía y medianoche", () => {
    expect(formatListingDate("2026-09-19T16:05:00Z")).toBe("19 de septiembre de 2026, 12:05 p. m.");
    expect(formatListingDate("2026-09-19T22:30:00Z")).toBe("19 de septiembre de 2026, 6:30 p. m.");
    expect(formatListingDate("2026-01-02T04:00:00Z")).toBe("2 de enero de 2026, 12:00 a. m.");
  });

  it("los conteos llevan coma de millares", () => {
    expect(formatCount(7)).toBe("7");
    expect(formatCount(1234)).toBe("1,234");
    expect(formatCount(1234567)).toBe("1,234,567");
  });
});
