import type { NextRequest } from "next/server";
import { parseRequestFilters } from "@/lib/admin/quotes-query";
import { loadRepairsReport } from "@/lib/reports/queries";
import { badFormat, guardAdmin, parseFormat, reportResponse } from "@/lib/reports/respond";

/** Reparaciones en Excel o PDF (`?formato=xlsx|pdf`), con los mismos filtros del listado. */
export async function GET(request: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const format = parseFormat(params.get("formato"));
  if (!format) return badFormat();

  const report = await loadRepairsReport(parseRequestFilters(Object.fromEntries(params)));
  return reportResponse(report, format);
}
