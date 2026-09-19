import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAGE_SIZE,
  countActiveFilters,
  parseCatalogFilters,
  serializeCatalogFilters,
} from "./search-params";

const parse = (
  params: Record<string, string | string[] | undefined>,
  category: string | null = null,
) => parseCatalogFilters(params, category);

describe("parseCatalogFilters", () => {
  it("sin parámetros devuelve los valores por defecto", () => {
    expect(parse({})).toEqual({
      categorySlug: null,
      brandSlugs: [],
      conditions: [],
      priceMin: null,
      priceMax: null,
      capacities: [],
      onlyInStock: false,
      query: null,
      sort: "relevancia",
      limit: DEFAULT_PAGE_SIZE,
    });
  });

  it("lee listas separadas por comas, sin repetidos y descartando lo inválido", () => {
    const filters = parse({
      marca: "apple,samsung,apple,MAL SLUG,xiaomi",
      condicion: "nuevo,usado,inventado,open_box",
      capacidad: " 128 GB , 256 GB ,,128 GB",
    });
    expect(filters.brandSlugs).toEqual(["apple", "samsung", "xiaomi"]);
    expect(filters.conditions).toEqual(["nuevo", "usado", "open_box"]);
    expect(filters.capacities).toEqual(["128 GB", "256 GB"]);
  });

  it("limita las listas a 12 elementos", () => {
    const many = Array.from({ length: 20 }, (_, i) => `marca-${i}`).join(",");
    expect(parse({ marca: many }).brandSlugs).toHaveLength(12);
  });

  it("usa solo el primer valor si el parámetro se repite", () => {
    expect(parse({ marca: ["apple", "samsung"] }).brandSlugs).toEqual(["apple"]);
  });

  it("valida el rango de precios y los intercambia si vienen al revés", () => {
    expect(parse({ precio_min: "1000", precio_max: "5000" })).toMatchObject({
      priceMin: 1000,
      priceMax: 5000,
    });
    expect(parse({ precio_min: "5000", precio_max: "1000" })).toMatchObject({
      priceMin: 1000,
      priceMax: 5000,
    });
    expect(parse({ precio_min: "-5", precio_max: "abc" })).toMatchObject({
      priceMin: null,
      priceMax: null,
    });
    expect(parse({ precio_max: "99999999999" }).priceMax).toBeNull();
    expect(parse({ precio_min: "" }).priceMin).toBeNull();
    expect(parse({ precio_min: "0" }).priceMin).toBe(0);
  });

  it("el orden solo acepta los valores conocidos", () => {
    expect(parse({ orden: "precio-asc" }).sort).toBe("precio-asc");
    expect(parse({ orden: "hack" }).sort).toBe("relevancia");
  });

  it("la búsqueda se recorta y se limita a 60 caracteres", () => {
    expect(parse({ q: "  iphone  " }).query).toBe("iphone");
    expect(parse({ q: "   " }).query).toBeNull();
    expect(parse({ q: "x".repeat(61) }).query).toBeNull();
    expect(parse({ q: "x".repeat(60) }).query).toBe("x".repeat(60));
  });

  it("el límite de productos debe ser entero entre el tamaño de página y 96", () => {
    expect(parse({ limite: "24" }).limit).toBe(24);
    expect(parse({ limite: "5" }).limit).toBe(DEFAULT_PAGE_SIZE);
    expect(parse({ limite: "200" }).limit).toBe(DEFAULT_PAGE_SIZE);
    expect(parse({ limite: "24.5" }).limit).toBe(DEFAULT_PAGE_SIZE);
    expect(parse({ limite: "abc" }).limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it("'stock=1' activa solo con stock y conserva la categoría", () => {
    expect(parse({ stock: "1" }, "audio")).toMatchObject({
      onlyInStock: true,
      categorySlug: "audio",
    });
    expect(parse({ stock: "0" }).onlyInStock).toBe(false);
  });
});

describe("serializeCatalogFilters y countActiveFilters", () => {
  it("hacer parse y serializar es reversible y omite lo que es por defecto", () => {
    const filters = parse({
      marca: "apple",
      precio_min: "100",
      stock: "1",
      orden: "nuevos",
      limite: "24",
    });
    const query = serializeCatalogFilters(filters).toString();
    expect(parse(Object.fromEntries(new URLSearchParams(query)))).toEqual(filters);
    expect(serializeCatalogFilters(parse({})).toString()).toBe("");
  });

  it("puede omitir la paginación", () => {
    const filters = parse({ limite: "24" });
    expect(serializeCatalogFilters(filters, { includePagination: false }).toString()).toBe("");
  });

  it("cuenta grupos de filtros activos (orden y paginación no cuentan)", () => {
    expect(countActiveFilters(parse({}))).toBe(0);
    expect(
      countActiveFilters(
        parse({
          marca: "apple",
          condicion: "nuevo",
          precio_min: "1",
          orden: "nuevos",
          limite: "24",
        }),
      ),
    ).toBe(3);
    expect(countActiveFilters(parse({ precio_min: "1", precio_max: "9" }))).toBe(1);
  });
});
