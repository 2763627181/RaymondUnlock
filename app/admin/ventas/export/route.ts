import type { NextRequest } from "next/server";
import { parseMonth } from "@/lib/reports/month";
import { loadSalesReport } from "@/lib/reports/queries";
import { badFormat, guardAdmin, parseFormat, reportResponse } from "@/lib/reports/respond";

/** Ventas de un mes en Excel o PDF (`?mes=2026-09&formato=xlsx|pdf`). Sin `mes`, el mes en curso. */
export async function GET(request: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const format = parseFormat(params.get("formato"));
  if (!format) return badFormat();

  const report = await loadSalesReport(parseMonth(params.get("mes") ?? undefined));
  return reportResponse(report, format);
}
