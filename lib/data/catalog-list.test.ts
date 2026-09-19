import { describe, expect, it } from "vitest";
import type {
  CatalogFilters,
  CatalogProduct,
  CatalogVariant,
  Category,
  ProductCondition,
} from "@/types/catalog";
import { buildCatalogIndex } from "./catalog-index";
import { listProducts } from "./catalog-list";
import type { CatalogSnapshot } from "./snapshot";

function category(id: string, parentId: string | null = null): Category {
  return {
    id,
    slug: id,
    name: id,
    description: null,
    icon: null,
    imageUrl: null,
    parentId,
    sortOrder: 1,
  };
}

function product(
  slug: string,
  overrides: Partial<CatalogProduct> & { categoryId: string },
): CatalogProduct {
  return {
    id: slug,
    slug,
    name: slug,
    shortDescription: null,
    description: null,
    brandId: null,
    condition: "nuevo",
    specs: {},
    isFeatured: false,
    warrantyNote: null,
    sortOrder: 1,
    createdAt: "2026-08-01T12:00:00+00:00",
    ...overrides,
  };
}

function variant(
  productId: string,
  n: number,
  price: number,
  stock: number,
  capacity: string | null = null,
): CatalogVariant {
  return {
    id: `${productId}-${n}`,
    productId,
    sku: null,
    capacity,
    color: null,
    colorHex: null,
    priceRetail: price,
    compareAtPrice: null,
    stock,
    sortOrder: n,
  };
}

const snapshot: CatalogSnapshot = {
  categories: [category("celulares"), category("accesorios"), category("cables", "accesorios")],
  brands: [
    { id: "apple", slug: "apple", name: "Apple", logoUrl: null, sortOrder: 1 },
    { id: "samsung", slug: "samsung", name: "Samsung", logoUrl: null, sortOrder: 2 },
  ],
  products: [
    product("iphone", {
      categoryId: "celulares",
      brandId: "apple",
      isFeatured: true,
      sortOrder: 1,
      createdAt: "2026-08-03T12:00:00+00:00",
    }),
    product("galaxy", {
      categoryId: "celulares",
      brandId: "samsung",
      condition: "usado" satisfies ProductCondition,
      sortOrder: 2,
      createdAt: "2026-08-02T12:00:00+00:00",
    }),
    product("cable-usbc", { categoryId: "cables", sortOrder: 3 }),
    product("borrador-sin-variantes", { categoryId: "celulares", sortOrder: 4 }),
    product("categoria-oculta", { categoryId: "no-publica", sortOrder: 5 }),
  ],
  variants: [
    variant("iphone", 1, 60000, 5, "128 GB"),
    variant("iphone", 2, 70000, 0, "256 GB"),
    variant("galaxy", 1, 30000, 2, "128 GB"),
    variant("cable-usbc", 1, 500, 10),
    variant("categoria-oculta", 1, 100, 1),
  ],
  images: [],
};

const index = buildCatalogIndex(snapshot);

const noFilters: CatalogFilters = {
  categorySlug: null,
  brandSlugs: [],
  conditions: [],
  priceMin: null,
  priceMax: null,
  capacities: [],
  onlyInStock: false,
  query: null,
  sort: "relevancia",
  limit: 24,
};

const slugs = (filters: Partial<CatalogFilters>) =>
  listProducts(index, { ...noFilters, ...filters }).items.map((item) => item.slug);

describe("buildCatalogIndex", () => {
  it("omite borradores sin variantes públicas y productos con categoría no pública", () => {
    expect(slugs({})).not.toContain("borrador-sin-variantes");
    expect(slugs({})).not.toContain("categoria-oculta");
    expect(index.productBySlug.has("borrador-sin-variantes")).toBe(false);
  });
});

describe("listProducts", () => {
  it("una categoría padre incluye los productos de sus subcategorías", () => {
    expect(slugs({ categorySlug: "accesorios" })).toEqual(["cable-usbc"]);
    expect(slugs({ categorySlug: "cables" })).toEqual(["cable-usbc"]);
  });

  it("filtra por marca y por condición", () => {
    expect(slugs({ brandSlugs: ["samsung"] })).toEqual(["galaxy"]);
    expect(slugs({ conditions: ["usado"] })).toEqual(["galaxy"]);
  });

  it("filtra por capacidad y por rango de precio usando las variantes", () => {
    expect(slugs({ capacities: ["256 GB"] })).toEqual(["iphone"]);
    expect(slugs({ priceMin: 40000, priceMax: 65000 })).toEqual(["iphone"]);
  });

  it("'solo con stock' descarta variantes agotadas y recalcula el precio mostrado", () => {
    const page = listProducts(index, { ...noFilters, onlyInStock: true, capacities: ["256 GB"] });
    expect(page.items).toEqual([]);

    const iphone = listProducts(index, { ...noFilters, onlyInStock: true }).items.find(
      (item) => item.slug === "iphone",
    );
    expect(iphone?.minPrice).toBe(60000);
    expect(iphone?.maxPrice).toBe(60000);
  });

  it("la búsqueda ignora acentos y mayúsculas y exige todas las palabras", () => {
    expect(slugs({ query: "IPHÓNE" })).toEqual(["iphone"]);
    expect(slugs({ query: "apple iphone" })).toEqual(["iphone"]);
    expect(slugs({ query: "apple galaxy" })).toEqual([]);
  });

  it("ordena por relevancia (destacados primero), precio y novedad", () => {
    expect(slugs({ sort: "relevancia" })[0]).toBe("iphone");
    expect(slugs({ sort: "precio-asc" })).toEqual(["cable-usbc", "galaxy", "iphone"]);
    expect(slugs({ sort: "precio-desc" })).toEqual(["iphone", "galaxy", "cable-usbc"]);
    expect(slugs({ sort: "nuevos" })[0]).toBe("iphone");
  });

  it("limit recorta los items pero total cuenta todos los resultados", () => {
    const page = listProducts(index, { ...noFilters, limit: 1 });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(3);
  });

  it("las facetas se calculan sobre la categoría y la búsqueda, no sobre los demás filtros", () => {
    const page = listProducts(index, { ...noFilters, brandSlugs: ["samsung"] });
    expect(page.items).toHaveLength(1);
    expect(page.facets.brands.map((brand) => brand.slug)).toEqual(["apple", "samsung"]);
    expect(page.facets.capacities).toEqual(["128 GB", "256 GB"]);
    expect(page.facets.priceBounds).toEqual({ min: 500, max: 70000 });
  });

  it("sin resultados el rango de precios es 0–0", () => {
    const page = listProducts(index, { ...noFilters, query: "zzz" });
    expect(page.total).toBe(0);
    expect(page.facets.priceBounds).toEqual({ min: 0, max: 0 });
  });
});
