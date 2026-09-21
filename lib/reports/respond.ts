import "server-only";
import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/viewer";
import { buildWorkbook } from "@/lib/reports/excel";
import { buildPdf } from "@/lib/reports/pdf-document";
import type { Report } from "@/lib/reports/types";

export type ReportFormat = "xlsx" | "pdf";

const FORMATS: Record<ReportFormat, { type: string }> = {
  xlsx: { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  pdf: { type: "application/pdf" },
};

export function parseFormat(value: string | null): ReportFormat | null {
  return value === "xlsx" || value === "pdf" ? value : null;
}

/**
 * El proxy solo comprueba que haya sesión: las descargas exigen además el rol
 * admin. Devuelve la respuesta de rechazo, o null si todo está bien.
 */
export async function guardAdmin(): Promise<NextResponse | null> {
  const viewer = await getViewer();
  return viewer?.isAdmin ? null : new NextResponse("No encontrado", { status: 404 });
}

export function badFormat(): NextResponse {
  return new NextResponse("Formato no válido: usa formato=xlsx o formato=pdf.", { status: 400 });
}

export async function reportResponse(report: Report, format: ReportFormat): Promise<NextResponse> {
  const file = format === "xlsx" ? await buildWorkbook(report) : await buildPdf(report);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": FORMATS[format].type,
      "Content-Disposition": `attachment; filename="${report.filename}.${format}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
