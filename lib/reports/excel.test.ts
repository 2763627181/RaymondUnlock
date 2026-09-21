import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { buildWorkbook } from "@/lib/reports/excel";
import { SAMPLE_BUSINESS, sampleQuotesReport, sampleSalesReport } from "@/lib/reports/sample";
import { buildSalesReport } from "@/lib/reports/sales-report";

async function load(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Uint8Array.from(buffer).buffer);
  return workbook;
}

/** Fila (1-based) del encabezado de la tabla: la que tiene la etiqueta dada en la columna A. */
function findRow(sheet: ExcelJS.Worksheet, label: string): number {
  let found = 0;
  sheet.eachRow((row, number) => {
    if (found === 0 && row.getCell(1).value === label) found = number;
  });
  return found;
}

describe("Excel del informe de ventas", async () => {
  const workbook = await load(await buildWorkbook(sampleSalesReport(8)));
  const sales = workbook.getWorksheet("Ventas");
  const products = workbook.getWorksheet("Productos vendidos");
  if (!sales || !products) throw new Error("faltan hojas");
  const header = findRow(sales, "Cierre");

  it("trae una hoja por tabla, con nombre legible", () => {
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Ventas",
      "Productos vendidos",
    ]);
  });

  it("lleva la marca arriba: franja negra, raya roja, título y quién lo generó", () => {
    expect(sales.getCell("A1").fill).toMatchObject({ fgColor: { argb: "FF0B0B0C" } });
    expect(sales.getCell("A2").fill).toMatchObject({ fgColor: { argb: "FFE11B22" } });
    expect(sales.getCell("A3").value).toBe("Informe de ventas");
    expect(sales.getCell("A4").value).toBe("Septiembre 2026 · cotizaciones cerradas en el mes");
    expect(String(sales.getCell("A5").value)).toContain(SAMPLE_BUSINESS.email);
  });

  it("muestra los indicadores del mes como tarjetas", () => {
    const labels: string[] = [];
    sales.getRow(7).eachCell((cell) => {
      if (cell.value) labels.push(String(cell.value));
    });
    // Cada tarjeta ocupa varias celdas combinadas; se lee una vez por tarjeta.
    expect([...new Set(labels)]).toEqual([
      "TOTAL VENDIDO",
      "VENTAS CERRADAS",
      "TICKET PROMEDIO",
      "UNIDADES VENDIDAS",
    ]);
    expect(String(sales.getRow(8).getCell(1).value)).toMatch(/^RD\$ [\d,]+\.\d{2}$/);
    expect(String(sales.getRow(9).getCell(1).value)).toContain("frente a Agosto 2026");
  });

  it("el encabezado es oscuro con letra blanca y tiene filtros y panel congelado", () => {
    expect(header).toBeGreaterThan(9);
    const cell = sales.getCell(header, 1);
    expect(cell.fill).toMatchObject({ fgColor: { argb: "FF0B0B0C" } });
    expect(cell.font).toMatchObject({ bold: true, color: { argb: "FFFFFFFF" } });
    expect(sales.autoFilter).toBe(`A${header}:G${header}`);
    expect(sales.views[0]).toMatchObject({ state: "frozen", ySplit: header });
  });

  it("el dinero es número con formato de pesos, no texto", () => {
    const total = sales.getCell(header + 1, 7);
    expect(typeof total.value).toBe("number");
    expect(total.numFmt).toBe('"RD$" #,##0.00');
    expect(sales.getCell(header + 1, 6).numFmt).toBe("#,##0");
  });

  it("las fechas son fechas de Excel y se leen en hora de Santo Domingo", () => {
    const closed = sales.getCell(header + 1, 1);
    expect(closed.value).toBeInstanceOf(Date);
    expect(closed.numFmt).toBe("dd/mm/yyyy hh:mm");
    // 15:00 UTC = 11:00 en Santo Domingo
    expect((closed.value as Date).getUTCHours()).toBe(11);
  });

  it("alterna el fondo de las filas y cierra con una fila de totales", () => {
    expect(sales.getCell(header + 1, 2).fill).not.toMatchObject({
      fgColor: { argb: "FFF5F6F8" },
    });
    expect(sales.getCell(header + 2, 2).fill).toMatchObject({ fgColor: { argb: "FFF5F6F8" } });
    const totalRow = header + 1 + 8;
    expect(sales.getCell(totalRow, 1).value).toBe("Total");
    expect(sales.getCell(totalRow, 1).font).toMatchObject({ bold: true });
    expect(typeof sales.getCell(totalRow, 7).value).toBe("number");
  });

  it("la segunda hoja agrupa por producto", () => {
    const productHeader = findRow(products, "Producto");
    expect(productHeader).toBeGreaterThan(0);
    expect(products.getCell(productHeader + 1, 1).value).toBeTruthy();
    expect(products.getCell(productHeader, 4).value).toBe("Total vendido");
  });

  it("queda lista para imprimir: horizontal, ajustada al ancho y con encabezado repetido", () => {
    expect(sales.pageSetup).toMatchObject({
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      printTitlesRow: `${header}:${header}`,
    });
  });
});

describe("Excel de cotizaciones", async () => {
  const workbook = await load(await buildWorkbook(sampleQuotesReport(10)));
  const sheet = workbook.getWorksheet("Cotizaciones");
  if (!sheet) throw new Error("falta la hoja");
  const header = findRow(sheet, "Fecha");

  it("pinta cada estado con su color y su nombre en español", () => {
    const statusColumn = 7;
    const seen = new Map<string, string>();
    for (let r = header + 1; r <= header + 10; r += 1) {
      const cell = sheet.getCell(r, statusColumn);
      const fill = cell.fill as ExcelJS.FillPattern;
      seen.set(String(cell.value), fill.fgColor?.argb ?? "");
    }
    expect(seen.get("Nueva")).toBe("FFE11B22");
    expect(seen.get("Cerrada")).toBe("FFDCFCE7");
    expect(seen.get("Cancelada")).toBe("FFE5E7EB");
  });

  it("el texto largo salta de línea y la fila crece", () => {
    const noteColumn = 10;
    let tall = false;
    for (let r = header + 1; r <= header + 10; r += 1) {
      if (sheet.getCell(r, noteColumn).alignment?.wrapText && (sheet.getRow(r).height ?? 0) > 30)
        tall = true;
    }
    expect(tall).toBe(true);
  });

  it("la fila de totales dice que no cuenta las canceladas", () => {
    const totalRow = header + 1 + 10;
    expect(sheet.getCell(totalRow, 1).value).toBe("Total (sin canceladas)");
  });
});

describe("Excel sin datos", () => {
  it("un mes sin ventas sale bien armado, con el aviso y sin filtros ni totales", async () => {
    const report = buildSalesReport({
      month: "2026-10",
      sales: [],
      previous: null,
      business: SAMPLE_BUSINESS,
      generatedAt: new Date("2026-10-31T12:00:00Z"),
    });
    const workbook = await load(await buildWorkbook(report));
    const sheet = workbook.getWorksheet("Ventas");
    expect(sheet).toBeDefined();
    let message = "";
    sheet?.eachRow((row) => {
      if (String(row.getCell(1).value).startsWith("No hay ventas"))
        message = String(row.getCell(1).value);
    });
    expect(message).toBe("No hay ventas cerradas en Octubre 2026.");
    expect(sheet?.autoFilter).toBeFalsy();
  });
});

describe("Excel y textos de clientes", () => {
  it("un texto que parece fórmula queda como texto, no se ejecuta", async () => {
    const report = sampleQuotesReport(1);
    const table = report.tables[0];
    if (!table?.rows[0]) throw new Error("sin filas");
    table.rows[0].customer = '=HYPERLINK("http://malo.example","clic")';
    table.rows[0].note = "+52 809 555 0100";

    const workbook = await load(await buildWorkbook(report));
    const sheet = workbook.getWorksheet("Cotizaciones");
    const header = sheet ? findRow(sheet, "Fecha") : 0;
    const customer = sheet?.getCell(header + 1, 3);
    expect(customer?.type).toBe(ExcelJS.ValueType.String);
    expect(customer?.value).toBe('=HYPERLINK("http://malo.example","clic")');
    expect(sheet?.getCell(header + 1, 10).type).toBe(ExcelJS.ValueType.String);
  });
});
