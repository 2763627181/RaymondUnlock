import { describe, expect, it } from "vitest";
import { describeFilters } from "@/lib/reports/filters";

describe("describeFilters", () => {
  it("sin filtros dice que es todo", () => {
    expect(describeFilters({ q: "", status: "" }, "Todas las cotizaciones")).toBe(
      "Todas las cotizaciones",
    );
    expect(describeFilters({ q: "   ", status: "" }, "Todo")).toBe("Todo");
  });

  it("nombra el estado y la búsqueda", () => {
    expect(describeFilters({ q: "", status: "cerrada" }, "x")).toBe("Estado: Cerrada");
    expect(describeFilters({ q: " ana ", status: "" }, "x")).toBe("Búsqueda: “ana”");
    expect(describeFilters({ q: "ana", status: "nueva" }, "x")).toBe(
      "Estado: Nueva · Búsqueda: “ana”",
    );
  });
});
