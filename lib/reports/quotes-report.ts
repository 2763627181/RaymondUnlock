import { formatMoney } from "@/lib/format";
import { CHANNEL_LABELS } from "@/lib/reports/cell";
import { dateStamp } from "@/lib/reports/month";
import type { Report, ReportBusiness, ReportColumn } from "@/lib/reports/types";

export interface QuoteItemRow {
  product_name: string;
  variant_label: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface QuoteExportRow {
  code: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  channel: string;
  status: string;
  subtotal: number;
  note: string | null;
  quote_items: QuoteItemRow[];
}

const round2 = (amount: number) => Math.round(amount * 100) / 100;

const QUOTE_COLUMNS: ReportColumn[] = [
  { key: "date", label: "Fecha", kind: "datetime", width: 19 },
  { key: "code", label: "Código", kind: "text", width: 15 },
  { key: "customer", label: "Cliente", kind: "text", width: 24 },
  { key: "phone", label: "Teléfono", kind: "text", width: 15 },
  { key: "email", label: "Correo", kind: "text", width: 28 },
  { key: "channel", label: "Canal", kind: "text", width: 11 },
  { key: "status", label: "Estado", kind: "status", width: 13 },
  { key: "items", label: "Artículos", kind: "integer", width: 10 },
  { key: "subtotal", label: "Subtotal", kind: "money", width: 16 },
  { key: "note", label: "Nota del cliente", kind: "text", width: 34, wrap: true },
];

const ITEM_COLUMNS: ReportColumn[] = [
  { key: "quote", label: "Cotización", kind: "text", width: 16 },
  { key: "status", label: "Estado", kind: "status", width: 13 },
  { key: "product", label: "Producto", kind: "text", width: 34, wrap: true },
  { key: "detail", label: "Detalle", kind: "text", width: 40, wrap: true },
  { key: "quantity", label: "Cant.", kind: "integer", width: 8 },
  { key: "unit", label: "Precio unidad", kind: "money", width: 17 },
  { key: "total", label: "Total", kind: "money", width: 17 },
];

export function buildQuotesReport(input: {
  quotes: QuoteExportRow[];
  filterDescription: string;
  /** Había más filas de las que caben en el archivo. */
  truncated: boolean;
  business: ReportBusiness;
  generatedAt: Date;
}): Report {
  const { quotes } = input;
  const closed = quotes.filter((quote) => quote.status === "cerrada").length;
  const pending = quotes.filter((quote) => quote.status === "nueva").length;
  const active = quotes.filter((quote) => quote.status !== "cancelada");
  const quoted = round2(active.reduce((sum, quote) => sum + quote.subtotal, 0));
  const closeRate = quotes.length > 0 ? Math.round((closed / quotes.length) * 100) : 0;

  const items = quotes.flatMap((quote) =>
    quote.quote_items.map((item) => ({
      quote: quote.code,
      status: quote.status,
      product: item.product_name,
      detail: item.variant_label,
      quantity: item.quantity,
      unit: item.unit_price,
      total: item.line_total,
    })),
  );

  const activeItems = items.filter((item) => item.status !== "cancelada");

  return {
    filename: `cotizaciones-${dateStamp(input.generatedAt)}`,
    title: "Informe de cotizaciones",
    subtitle: input.truncated
      ? `${input.filterDescription} · se muestran las primeras ${quotes.length}`
      : input.filterDescription,
    generatedAt: input.generatedAt,
    business: input.business,
    kpis: [
      { label: "Cotizaciones", value: quotes.length.toLocaleString("es-DO") },
      {
        label: "Monto cotizado",
        value: formatMoney(quoted),
        hint: "Sin contar las canceladas",
      },
      {
        label: "Tasa de cierre",
        value: `${closeRate} %`,
        hint: `${closed} cerradas de ${quotes.length}`,
      },
      { label: "Por atender", value: pending.toLocaleString("es-DO"), hint: "Estado: nueva" },
    ],
    tables: [
      {
        title: "Cotizaciones",
        columns: QUOTE_COLUMNS,
        rows: quotes.map((quote) => ({
          date: new Date(quote.created_at),
          code: quote.code,
          customer: quote.customer_name,
          phone: quote.customer_phone,
          email: quote.customer_email,
          channel: CHANNEL_LABELS[quote.channel] ?? quote.channel,
          status: quote.status,
          items: quote.quote_items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: quote.subtotal,
          note: quote.note,
        })),
        totals: {
          items: active.reduce(
            (sum, quote) => sum + quote.quote_items.reduce((n, item) => n + item.quantity, 0),
            0,
          ),
          subtotal: quoted,
        },
        totalsLabel: "Total (sin canceladas)",
        emptyMessage: "No hay cotizaciones con estos filtros.",
      },
      {
        title: "Artículos cotizados",
        columns: ITEM_COLUMNS,
        rows: items,
        totals: {
          quantity: activeItems.reduce((sum, item) => sum + item.quantity, 0),
          total: round2(activeItems.reduce((sum, item) => sum + item.total, 0)),
        },
        totalsLabel: "Total (sin canceladas)",
        emptyMessage: "Sin artículos.",
      },
    ],
  };
}
