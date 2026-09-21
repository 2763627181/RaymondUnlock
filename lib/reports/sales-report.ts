import { formatMoney } from "@/lib/format";
import { CHANNEL_LABELS } from "@/lib/reports/cell";
import { monthLabel, shiftMonth } from "@/lib/reports/month";
import type { Report, ReportBusiness, ReportColumn } from "@/lib/reports/types";

/** Una venta es una cotización en estado "cerrada"; `closed_at` es cuándo se cerró. */
export interface SaleRow {
  code: string;
  closed_at: string;
  customer_name: string;
  customer_phone: string;
  channel: string;
  subtotal: number;
  quote_items: {
    product_name: string;
    variant_label: string | null;
    quantity: number;
    line_total: number;
  }[];
}

/** Lo vendido el mes anterior, para comparar (null si no se consultó). */
export interface PreviousMonthTotals {
  total: number;
  count: number;
}

const round2 = (amount: number) => Math.round(amount * 100) / 100;
const sum = (values: number[]) => round2(values.reduce((total, value) => total + value, 0));

const SALE_COLUMNS: ReportColumn[] = [
  { key: "closedAt", label: "Cierre", kind: "datetime", width: 19 },
  { key: "code", label: "Cotización", kind: "text", width: 16 },
  { key: "customer", label: "Cliente", kind: "text", width: 28 },
  { key: "phone", label: "Teléfono", kind: "text", width: 16 },
  { key: "channel", label: "Canal", kind: "text", width: 12 },
  { key: "units", label: "Unidades", kind: "integer", width: 11 },
  { key: "total", label: "Total vendido", kind: "money", width: 18 },
];

const PRODUCT_COLUMNS: ReportColumn[] = [
  { key: "product", label: "Producto", kind: "text", width: 36, wrap: true },
  { key: "detail", label: "Detalle (con código)", kind: "text", width: 44, wrap: true },
  { key: "units", label: "Unidades", kind: "integer", width: 12 },
  { key: "total", label: "Total vendido", kind: "money", width: 18 },
];

function comparison(total: number, previous: PreviousMonthTotals | null, month: string): string {
  const label = monthLabel(shiftMonth(month, -1));
  if (previous === null || previous.total <= 0) return `Sin ventas en ${label}`;
  const change = Math.round(((total - previous.total) / previous.total) * 100);
  const sign = change > 0 ? "+" : change < 0 ? "−" : "";
  return `${sign}${Math.abs(change)} % frente a ${label}`;
}

export function buildSalesReport(input: {
  month: string;
  sales: SaleRow[];
  previous: PreviousMonthTotals | null;
  business: ReportBusiness;
  generatedAt: Date;
}): Report {
  const { month, sales } = input;
  const total = sum(sales.map((sale) => sale.subtotal));
  const unitsOf = (sale: SaleRow) => sale.quote_items.reduce((n, item) => n + item.quantity, 0);
  const units = sales.reduce((n, sale) => n + unitsOf(sale), 0);

  // Lo vendido por producto y variante, de lo que más dinero dejó a lo que menos.
  const byProduct = new Map<
    string,
    { product: string; detail: string | null; units: number; total: number }
  >();
  for (const item of sales.flatMap((sale) => sale.quote_items)) {
    const key = JSON.stringify([item.product_name, item.variant_label]);
    const current = byProduct.get(key) ?? {
      product: item.product_name,
      detail: item.variant_label,
      units: 0,
      total: 0,
    };
    current.units += item.quantity;
    current.total = round2(current.total + item.line_total);
    byProduct.set(key, current);
  }
  const products = [...byProduct.values()].sort((a, b) => b.total - a.total);

  return {
    filename: `ventas-${month}`,
    title: "Informe de ventas",
    subtitle: `${monthLabel(month)} · cotizaciones cerradas en el mes`,
    generatedAt: input.generatedAt,
    business: input.business,
    kpis: [
      {
        label: "Total vendido",
        value: formatMoney(total),
        hint: comparison(total, input.previous, month),
      },
      { label: "Ventas cerradas", value: sales.length.toLocaleString("es-DO") },
      {
        label: "Ticket promedio",
        value: formatMoney(sales.length > 0 ? round2(total / sales.length) : 0),
        hint: "Por venta",
      },
      { label: "Unidades vendidas", value: units.toLocaleString("es-DO") },
    ],
    tables: [
      {
        title: "Ventas",
        columns: SALE_COLUMNS,
        rows: sales.map((sale) => ({
          closedAt: new Date(sale.closed_at),
          code: sale.code,
          customer: sale.customer_name,
          phone: sale.customer_phone,
          channel: CHANNEL_LABELS[sale.channel] ?? sale.channel,
          units: unitsOf(sale),
          total: sale.subtotal,
        })),
        totals: { units, total },
        emptyMessage: `No hay ventas cerradas en ${monthLabel(month)}.`,
      },
      {
        title: "Productos vendidos",
        columns: PRODUCT_COLUMNS,
        rows: products,
        totals: { units, total: sum(products.map((product) => product.total)) },
        emptyMessage: "Sin productos vendidos.",
      },
    ],
  };
}
