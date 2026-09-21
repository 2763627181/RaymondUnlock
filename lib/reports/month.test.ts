import { describe, expect, it } from "vitest";
import {
  currentMonth,
  isMonth,
  monthLabel,
  monthRange,
  parseMonth,
  shiftMonth,
  toExcelWallClock,
} from "@/lib/reports/month";

describe("meses del informe", () => {
  it("valida el formato AAAA-MM", () => {
    expect(isMonth("2026-09")).toBe(true);
    for (const bad of [
      "2026-13",
      "2026-00",
      "26-09",
      "2026-9",
      "abril",
      "1999-05",
      "2101-01",
      "",
    ]) {
      expect(isMonth(bad)).toBe(false);
    }
  });

  it("el mes en curso es el de Santo Domingo, no el de UTC", () => {
    // 1 de octubre a las 02:00 UTC todavía es 30 de septiembre a las 22:00 en Santo Domingo.
    expect(currentMonth(new Date("2026-10-01T02:00:00Z"))).toBe("2026-09");
    expect(currentMonth(new Date("2026-10-01T04:00:00Z"))).toBe("2026-10");
  });

  it("una URL sin mes o con basura usa el mes en curso", () => {
    const now = new Date("2026-09-21T15:00:00Z");
    expect(parseMonth(undefined, now)).toBe("2026-09");
    expect(parseMonth("hack", now)).toBe("2026-09");
    expect(parseMonth("2026-03", now)).toBe("2026-03");
  });

  it("avanza y retrocede entre meses cruzando el año", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-09", 0)).toBe("2026-09");
    expect(shiftMonth("2026-01", -13)).toBe("2024-12");
  });

  it("el rango del mes va de medianoche a medianoche de Santo Domingo", () => {
    expect(monthRange("2026-09")).toEqual({
      start: "2026-09-01T00:00:00-04:00",
      end: "2026-10-01T00:00:00-04:00",
    });
    expect(monthRange("2026-12").end).toBe("2027-01-01T00:00:00-04:00");
  });

  it("una venta de las 10 pm del día 30 cae dentro de su mes", () => {
    const { start, end } = monthRange("2026-09");
    const sale = new Date("2026-10-01T02:00:00Z"); // 30/09 22:00 en Santo Domingo
    expect(sale >= new Date(start) && sale < new Date(end)).toBe(true);
  });

  it("escribe el mes en español con mayúscula", () => {
    expect(monthLabel("2026-09")).toBe("Septiembre 2026");
    expect(monthLabel("2027-01")).toBe("Enero 2027");
  });

  it("para Excel, la hora que se ve es la de Santo Domingo", () => {
    const shifted = toExcelWallClock(new Date("2026-09-21T14:30:00Z")); // 10:30 en Santo Domingo
    expect(shifted.getUTCHours()).toBe(10);
    expect(shifted.getUTCMinutes()).toBe(30);
  });
});
