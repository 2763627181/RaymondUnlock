import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";
import { parseRequestFilters, searchClause } from "./quotes-query";
import { pageRange, parsePage, totalPages } from "./pagination";
import { SLUG_PATTERN, slugify } from "./slug";
import { storagePathFromUrl } from "./storage-path";
import { customerWhatsAppNumber, isRequestStatus } from "./status";

describe("slugify", () => {
  it("quita acentos y signos y une con guiones", () => {
    expect(slugify("Cámara: Galaxy S24 Ultra (256 GB)")).toBe("camara-galaxy-s24-ultra-256-gb");
    expect(slugify("  --Ñandú  ")).toBe("nandu");
  });
  it("siempre cumple el patrón de la base o queda vacío", () => {
    for (const text of ["iPhone 15 Pro", "AirPods Pro 2", "Cable USB-C → Lightning", "!!!"]) {
      const slug = slugify(text);
      expect(slug === "" || SLUG_PATTERN.test(slug)).toBe(true);
    }
    expect(slugify("!!!")).toBe("");
  });
  it("limita el largo sin dejar un guion al final", () => {
    const slug = slugify(`${"a".repeat(79)} b`);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("toCsv", () => {
  it("escapa comillas, comas y saltos de línea", () => {
    const csv = toCsv(
      ["a", "b"],
      [
        ['dijo "hola"', "x,y"],
        ["l1\nl2", 5],
      ],
    );
    expect(csv).toContain('"dijo ""hola""","x,y"');
    expect(csv).toContain('"l1\nl2",5');
  });
  it("neutraliza fórmulas en texto pero no en números", () => {
    const csv = toCsv(["v"], [["=HYPERLINK(1)"], ["+52"], ["@cmd"], ["-1"], [-5]]);
    expect(csv).toContain("'=HYPERLINK(1)");
    expect(csv).toContain("'+52");
    expect(csv).toContain("'@cmd");
    expect(csv).toContain("'-1");
    expect(csv).toContain("\r\n-5\r\n");
  });
  it("incluye BOM UTF-8 y celdas vacías", () => {
    const csv = toCsv(["a", "b"], [[null, undefined]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("\r\n,\r\n");
  });
});

describe("paginación", () => {
  it("normaliza la página de la URL", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(["2", "9"])).toBe(2);
    for (const bad of [undefined, "0", "-4", "abc", "1e9x"]) {
      expect(parsePage(bad)).toBe(1);
    }
  });
  it("calcula rango y total de páginas", () => {
    expect(pageRange(1, 20)).toEqual({ from: 0, to: 19 });
    expect(pageRange(3, 20)).toEqual({ from: 40, to: 59 });
    expect(totalPages(0)).toBe(1);
    expect(totalPages(41, 20)).toBe(3);
  });
});

describe("estado y WhatsApp del cliente", () => {
  it("valida estados", () => {
    expect(isRequestStatus("nueva")).toBe(true);
    expect(isRequestStatus("otro")).toBe(false);
  });
  it("arma el número internacional dominicano", () => {
    expect(customerWhatsAppNumber("809-555-0101")).toBe("18095550101");
    expect(customerWhatsAppNumber("18095550101")).toBe("18095550101");
  });
});

describe("storagePathFromUrl", () => {
  const base = "https://abc.supabase.co/storage/v1/object/public/products";
  it("extrae la ruta dentro del bucket", () => {
    expect(storagePathFromUrl(`${base}/p1/foto.webp`)).toBe("p1/foto.webp");
    expect(storagePathFromUrl(`${base}/banners/a%20b.webp?v=1`)).toBe("banners/a b.webp");
  });
  it("ignora imágenes que no son de nuestro Storage y rutas sospechosas", () => {
    expect(storagePathFromUrl("/seed/phone-back.svg")).toBeNull();
    expect(storagePathFromUrl("https://otro.com/x.png")).toBeNull();
    expect(storagePathFromUrl(`${base}/../secreto`)).toBeNull();
    expect(storagePathFromUrl(`${base}/`)).toBeNull();
  });
});

describe("filtros de solicitudes", () => {
  it("valida estado, tipo y página de la URL", () => {
    const filters = parseRequestFilters({
      q: " ana ",
      estado: "nueva",
      tipo: "wholesale",
      page: "2",
    });
    expect(filters).toEqual({ q: " ana ", status: "nueva", tier: "wholesale", page: 2 });
    expect(parseRequestFilters({ estado: "hack", tipo: "x", page: "-1" })).toEqual({
      q: "",
      status: "",
      tier: "",
      page: 1,
    });
  });

  it("la búsqueda no puede inyectar operadores en el filtro or", () => {
    const clause = searchClause("a,code.eq.RU)", ["code", "customer_name"]);
    expect(clause).toBe("code.ilike.%a code.eq.RU%,customer_name.ilike.%a code.eq.RU%");
    expect(clause).not.toContain(")");
    expect(searchClause("  ", ["code"])).toBeNull();
    expect(searchClause("%%__", ["code"])).toBeNull();
  });
});
