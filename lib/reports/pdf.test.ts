import { describe, expect, it } from "vitest";
import { buildPdf } from "@/lib/reports/pdf-document";
import { sampleQuotesReport, sampleSalesReport } from "@/lib/reports/sample";

/** Páginas de un PDF: los objetos "/Type /Page" (sin contar "/Type /Pages"). */
function pageCount(pdf: Buffer): number {
  return (pdf.toString("latin1").match(/\/Type \/Page(?![s])/g) ?? []).length;
}

describe("PDF de los informes", () => {
  it("genera un PDF válido con una página por tabla cuando caben", async () => {
    const pdf = await buildPdf(sampleSalesReport(8));
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(3000);
    expect(pageCount(pdf)).toBe(2);
  }, 30_000);

  it("una tabla larga continúa en más páginas", async () => {
    const pdf = await buildPdf(sampleQuotesReport(120));
    expect(pageCount(pdf)).toBeGreaterThan(4);
  }, 60_000);

  it("un informe vacío también sale (con su aviso)", async () => {
    const report = sampleSalesReport(0);
    const pdf = await buildPdf(report);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);
});
