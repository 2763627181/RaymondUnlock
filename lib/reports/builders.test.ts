import { describe, expect, it } from "vitest";
import { buildQuotesReport, type QuoteExportRow } from "@/lib/reports/quotes-report";
import { buildRepairsReport, type RepairExportRow } from "@/lib/reports/repairs-report";
import { buildSalesReport, type SaleRow } from "@/lib/reports/sales-report";
import type { ReportBusiness } from "@/lib/reports/types";

const business: ReportBusiness = {
  name: "Raymond Unlock",
  tagline: "Celulares y Más",
  phone: "809-906-3114",
  email: "raymondunlock01@gmail.com",
  address: "Calle México #6, Santo Domingo",
};
const generatedAt = new Date("2026-09-21T15:00:00Z");

const kpi = (report: { kpis: { label: string; value: string; hint?: string }[] }, label: string) =>
  report.kpis.find((item) => item.label === label);

describe("informe de ventas", () => {
  const sales: SaleRow[] = [
    {
      code: "RU-2026-0001",
      closed_at: "2026-09-05T15:00:00Z",
      customer_name: "Ana Pérez",
      customer_phone: "809-555-0101",
      channel: "whatsapp",
      subtotal: 64500,
      quote_items: [
        {
          product_name: "iPhone 13",
          variant_label: "128 GB · Azul · RU-00012",
          quantity: 1,
          line_total: 32500,
        },
        { product_name: "Cable USB-C", variant_label: null, quantity: 2, line_total: 32000 },
      ],
    },
    {
      code: "RU-2026-0002",
      closed_at: "2026-09-20T15:00:00Z",
      customer_name: "Beto Gómez",
      customer_phone: "809-555-0102",
      channel: "email",
      subtotal: 32500,
      quote_items: [
        {
          product_name: "iPhone 13",
          variant_label: "128 GB · Azul · RU-00012",
          quantity: 1,
          line_total: 32500,
        },
      ],
    },
  ];

  const report = buildSalesReport({
    month: "2026-09",
    sales,
    previous: { total: 80000, count: 3 },
    business,
    generatedAt,
  });

  it("resume el mes: total, ventas, ticket promedio y unidades", () => {
    expect(kpi(report, "Ventas cerradas")?.value).toBe("2");
    expect(kpi(report, "Total vendido")?.value).toBe("RD$ 97,000.00");
    expect(kpi(report, "Ticket promedio")?.value).toBe("RD$ 48,500.00");
    expect(kpi(report, "Unidades vendidas")?.value).toBe("4");
  });

  it("compara con el mes anterior", () => {
    expect(kpi(report, "Total vendido")?.hint).toBe("+21 % frente a Agosto 2026");
    const down = buildSalesReport({
      month: "2026-09",
      sales,
      previous: { total: 190000, count: 9 },
      business,
      generatedAt,
    });
    expect(kpi(down, "Total vendido")?.hint).toBe("−49 % frente a Agosto 2026");
    const none = buildSalesReport({
      month: "2026-09",
      sales,
      previous: null,
      business,
      generatedAt,
    });
    expect(kpi(none, "Total vendido")?.hint).toBe("Sin ventas en Agosto 2026");
  });

  it("la tabla de ventas suma unidades y total", () => {
    const [table] = report.tables;
    expect(table?.rows).toHaveLength(2);
    expect(table?.rows[0]).toMatchObject({
      code: "RU-2026-0001",
      units: 3,
      total: 64500,
      channel: "WhatsApp",
    });
    expect(table?.totals).toEqual({ units: 4, total: 97000 });
  });

  it("agrupa lo vendido por producto y variante, de mayor a menor monto", () => {
    const products = report.tables[1];
    expect(products?.rows.map((row) => [row.product, row.units, row.total])).toEqual([
      ["iPhone 13", 2, 65000],
      ["Cable USB-C", 2, 32000],
    ]);
    expect(products?.totals).toEqual({ units: 4, total: 97000 });
  });

  it("un mes sin ventas sale con ceros y un aviso, sin romperse", () => {
    const empty = buildSalesReport({
      month: "2026-10",
      sales: [],
      previous: null,
      business,
      generatedAt,
    });
    expect(kpi(empty, "Total vendido")?.value).toBe("RD$ 0.00");
    expect(kpi(empty, "Ticket promedio")?.value).toBe("RD$ 0.00");
    expect(empty.tables[0]?.emptyMessage).toBe("No hay ventas cerradas en Octubre 2026.");
    expect(empty.filename).toBe("ventas-2026-10");
  });
});

describe("informe de cotizaciones", () => {
  const item = {
    product_name: "iPhone 13",
    variant_label: "128 GB · RU-00012",
    quantity: 1,
    unit_price: 1000,
    line_total: 1000,
  };
  const quote = (code: string, status: string, subtotal: number): QuoteExportRow => ({
    code,
    created_at: "2026-09-10T14:00:00Z",
    customer_name: "Cliente",
    customer_phone: "809-000-0000",
    customer_email: null,
    channel: "both",
    status,
    subtotal,
    note: null,
    quote_items: [{ ...item, unit_price: subtotal, line_total: subtotal }],
  });
  const quotes = [
    quote("A", "cerrada", 3000),
    quote("B", "nueva", 2000),
    quote("C", "cancelada", 5000),
  ];
  const report = buildQuotesReport({
    quotes,
    filterDescription: "Todas las cotizaciones",
    truncated: false,
    business,
    generatedAt,
  });

  it("el monto cotizado y los totales no cuentan las canceladas", () => {
    expect(kpi(report, "Monto cotizado")?.value).toBe("RD$ 5,000.00");
    expect(report.tables[0]?.totals).toEqual({ items: 2, subtotal: 5000 });
    expect(report.tables[1]?.totals).toEqual({ quantity: 2, total: 5000 });
    expect(report.tables[0]?.rows).toHaveLength(3);
  });

  it("calcula la tasa de cierre y lo que falta por atender", () => {
    expect(kpi(report, "Tasa de cierre")).toMatchObject({ value: "33 %", hint: "1 cerradas de 3" });
    expect(kpi(report, "Por atender")?.value).toBe("1");
  });

  it("lista los artículos de cada cotización con su estado", () => {
    expect(report.tables[1]?.rows.map((row) => [row.quote, row.status])).toEqual([
      ["A", "cerrada"],
      ["B", "nueva"],
      ["C", "cancelada"],
    ]);
  });

  it("avisa cuando el archivo trae solo una parte y nombra el archivo con la fecha", () => {
    const partial = buildQuotesReport({
      quotes,
      filterDescription: "Estado: Nueva",
      truncated: true,
      business,
      generatedAt,
    });
    expect(partial.subtitle).toBe("Estado: Nueva · se muestran las primeras 3");
    expect(report.filename).toBe("cotizaciones-2026-09-21");
  });

  it("sin cotizaciones no divide entre cero", () => {
    const empty = buildQuotesReport({
      quotes: [],
      filterDescription: "x",
      truncated: false,
      business,
      generatedAt,
    });
    expect(kpi(empty, "Tasa de cierre")?.value).toBe("0 %");
  });
});

describe("informe de reparaciones", () => {
  const repair = (status: string): RepairExportRow => ({
    code: "RE-1",
    created_at: "2026-09-10T14:00:00Z",
    customer_name: "Cliente",
    customer_phone: "809-000-0000",
    customer_email: null,
    device: "iPhone 13",
    issue_description: "Pantalla rota",
    status,
    service: { name: "Cambio de pantalla" },
  });
  const report = buildRepairsReport({
    repairs: ["nueva", "nueva", "contactada", "cotizada", "cerrada", "cancelada"].map(repair),
    filterDescription: "Todas las reparaciones",
    truncated: false,
    business,
    generatedAt,
  });

  it("cuenta por atender, en seguimiento y cerradas", () => {
    expect(kpi(report, "Solicitudes")?.value).toBe("6");
    expect(kpi(report, "Por atender")?.value).toBe("2");
    expect(kpi(report, "En seguimiento")?.value).toBe("2");
    expect(kpi(report, "Cerradas")).toMatchObject({ value: "1", hint: "1 canceladas" });
  });

  it("una solicitud sin servicio deja la celda vacía", () => {
    const one = buildRepairsReport({
      repairs: [{ ...repair("nueva"), service: null }],
      filterDescription: "x",
      truncated: false,
      business,
      generatedAt,
    });
    expect(one.tables[0]?.rows[0]?.service).toBeNull();
    expect(one.filename).toBe("reparaciones-2026-09-21");
  });
});
