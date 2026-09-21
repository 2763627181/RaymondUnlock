import { buildQuotesReport, type QuoteExportRow } from "@/lib/reports/quotes-report";
import { buildSalesReport, type SaleRow } from "@/lib/reports/sales-report";
import type { Report, ReportBusiness } from "@/lib/reports/types";

/** Datos de ejemplo para probar y revisar a simple vista cómo salen los archivos. */
export const SAMPLE_BUSINESS: ReportBusiness = {
  name: "Raymond Unlock",
  tagline: "Celulares y Más",
  phone: "809-906-3114",
  email: "raymondunlock01@gmail.com",
  address: "Calle México #6, casi esq. Isabel Aguiar, Santo Domingo",
};

const GENERATED_AT = new Date("2026-09-21T15:00:00Z");

const PHONES = [
  ["iPhone 13", "128 GB · Azul · Batería 92 % · Factory · RU-00012", 32500],
  ["iPhone 14 Pro", "256 GB · Morado · Batería 98 % · Por artista · RU-00020", 61900],
  ["Samsung Galaxy S24", "256 GB · Negro · RU-00031", 54900],
  ["AirPods Pro (2.ª gen)", "Blanco · RU-00044", 13500],
] as const;

export function sampleSales(count: number): SaleRow[] {
  return Array.from({ length: count }, (_, index) => {
    const [name, label, price] = PHONES[index % PHONES.length] ?? PHONES[0];
    const quantity = (index % 3) + 1;
    return {
      code: `RU-2026-${String(index + 1).padStart(4, "0")}`,
      closed_at: `2026-09-${String((index % 27) + 1).padStart(2, "0")}T15:00:00Z`,
      customer_name:
        ["Ana Pérez", "Beto Gómez", "Carla Núñez", "Darío Ramírez"][index % 4] ?? "Cliente",
      customer_phone: `809-555-${String(1000 + index)}`,
      channel: ["whatsapp", "email", "both"][index % 3] ?? "whatsapp",
      subtotal: price * quantity,
      quote_items: [
        { product_name: name, variant_label: label, quantity, line_total: price * quantity },
      ],
    };
  });
}

export function sampleSalesReport(count = 8): Report {
  return buildSalesReport({
    month: "2026-09",
    sales: sampleSales(count),
    previous: { total: 180000, count: 5 },
    business: SAMPLE_BUSINESS,
    generatedAt: GENERATED_AT,
  });
}

export function sampleQuotesReport(count = 12): Report {
  const statuses = ["nueva", "contactada", "cotizada", "cerrada", "cancelada"];
  const quotes: QuoteExportRow[] = sampleSales(count).map((sale, index) => ({
    code: sale.code,
    created_at: sale.closed_at,
    customer_name: sale.customer_name,
    customer_phone: sale.customer_phone,
    customer_email: index % 2 === 0 ? "cliente@example.com" : null,
    channel: sale.channel,
    status: statuses[index % statuses.length] ?? "nueva",
    subtotal: sale.subtotal,
    note:
      index % 3 === 0
        ? "Necesito factura con RNC y la entrega a domicilio en Naco, por favor."
        : null,
    quote_items: sale.quote_items.map((item) => ({
      ...item,
      unit_price: item.line_total / item.quantity,
    })),
  }));
  return buildQuotesReport({
    quotes,
    filterDescription: "Todas las cotizaciones",
    truncated: false,
    business: SAMPLE_BUSINESS,
    generatedAt: GENERATED_AT,
  });
}
