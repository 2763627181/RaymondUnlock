import "server-only";
import { searchClause, type RequestFilters } from "@/lib/admin/quotes-query";
import { getSiteSettings } from "@/lib/data";
import { createSessionClient } from "@/lib/supabase/server";
import { describeFilters } from "@/lib/reports/filters";
import { monthRange, shiftMonth } from "@/lib/reports/month";
import { buildQuotesReport } from "@/lib/reports/quotes-report";
import { buildRepairsReport } from "@/lib/reports/repairs-report";
import { buildSalesReport, type PreviousMonthTotals } from "@/lib/reports/sales-report";
import type { Report, ReportBusiness } from "@/lib/reports/types";

/** Tope de filas por archivo: más que eso no se lee bien y tarda demasiado. */
export const MAX_EXPORT_ROWS = 5000;

async function loadBusiness(): Promise<ReportBusiness> {
  const settings = await getSiteSettings();
  return {
    name: settings.businessName,
    tagline: settings.tagline,
    phone: settings.phoneDisplay,
    email: settings.email,
    address: settings.address,
  };
}

/*
 * Estas lecturas usan la sesión del admin (el RLS decide) y solo se llaman desde
 * rutas que ya comprobaron el rol con `guardAdmin()`.
 */

export async function loadQuotesReport(filters: RequestFilters): Promise<Report> {
  const supabase = await createSessionClient();
  let query = supabase
    .from("quotes")
    .select(
      "code, created_at, customer_name, customer_phone, customer_email, channel, status, subtotal, note, quote_items(product_name, variant_label, quantity, unit_price, line_total)",
    );
  if (filters.status) query = query.eq("status", filters.status);
  const clause = searchClause(filters.q, [
    "code",
    "customer_name",
    "customer_phone",
    "customer_email",
  ]);
  if (clause) query = query.or(clause);

  const [{ data, error }, business] = await Promise.all([
    query.order("created_at", { ascending: false }).limit(MAX_EXPORT_ROWS + 1),
    loadBusiness(),
  ]);
  if (error) throw new Error(`No se pudieron leer las cotizaciones: ${error.message}`);

  return buildQuotesReport({
    quotes: data.slice(0, MAX_EXPORT_ROWS),
    filterDescription: describeFilters(filters, "Todas las cotizaciones"),
    truncated: data.length > MAX_EXPORT_ROWS,
    business,
    generatedAt: new Date(),
  });
}

export async function loadRepairsReport(filters: RequestFilters): Promise<Report> {
  const supabase = await createSessionClient();
  let query = supabase
    .from("repair_requests")
    .select(
      "code, created_at, customer_name, customer_phone, customer_email, device, issue_description, status, service:services(name)",
    );
  if (filters.status) query = query.eq("status", filters.status);
  const clause = searchClause(filters.q, ["code", "customer_name", "customer_phone", "device"]);
  if (clause) query = query.or(clause);

  const [{ data, error }, business] = await Promise.all([
    query.order("created_at", { ascending: false }).limit(MAX_EXPORT_ROWS + 1),
    loadBusiness(),
  ]);
  if (error) throw new Error(`No se pudieron leer las reparaciones: ${error.message}`);

  return buildRepairsReport({
    repairs: data.slice(0, MAX_EXPORT_ROWS),
    filterDescription: describeFilters(filters, "Todas las reparaciones"),
    truncated: data.length > MAX_EXPORT_ROWS,
    business,
    generatedAt: new Date(),
  });
}

/** Ventas de un mes ("2026-09"): las cotizaciones que se cerraron en ese mes. */
export async function loadSalesReport(month: string): Promise<Report> {
  const supabase = await createSessionClient();
  const current = monthRange(month);
  const before = monthRange(shiftMonth(month, -1));

  const [sales, previous, business] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "code, closed_at, customer_name, customer_phone, channel, subtotal, quote_items(product_name, variant_label, quantity, line_total)",
      )
      .eq("status", "cerrada")
      .gte("closed_at", current.start)
      .lt("closed_at", current.end)
      .order("closed_at", { ascending: true })
      .limit(MAX_EXPORT_ROWS),
    supabase
      .from("quotes")
      .select("subtotal")
      .eq("status", "cerrada")
      .gte("closed_at", before.start)
      .lt("closed_at", before.end)
      .limit(MAX_EXPORT_ROWS),
    loadBusiness(),
  ]);
  if (sales.error) throw new Error(`No se pudieron leer las ventas: ${sales.error.message}`);
  if (previous.error) throw new Error(`No se pudo leer el mes anterior: ${previous.error.message}`);

  const previousTotals: PreviousMonthTotals = {
    total: previous.data.reduce((sum, row) => sum + row.subtotal, 0),
    count: previous.data.length,
  };

  return buildSalesReport({
    month,
    sales: sales.data.flatMap((row) =>
      row.closed_at ? [{ ...row, closed_at: row.closed_at }] : [],
    ),
    previous: previousTotals,
    business,
    generatedAt: new Date(),
  });
}
