import { REQUEST_STATUS_LABELS, isRequestStatus } from "@/lib/admin/status";
import { formatMoney } from "@/lib/format";
import type { ReportColumn, ReportValue } from "@/lib/reports/types";

const EMPTY = "—";

/** "01/09/2026 11:00": igual que el formato de fecha de la hoja de Excel, en hora de Santo Domingo. */
const compactDateTime = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Santo_Domingo",
});

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Correo",
  both: "Ambos",
};

export function statusLabel(value: string): string {
  return isRequestStatus(value) ? REQUEST_STATUS_LABELS[value] : value;
}

/** Cómo se lee una celda en el PDF (Excel usa el valor con su propio formato numérico). */
export function displayValue(column: ReportColumn, value: ReportValue): string {
  if (value === null || value === "") return EMPTY;
  if (value instanceof Date) return compactDateTime.format(value).replace(",", "");
  if (typeof value === "number") {
    return column.kind === "money" ? formatMoney(value) : value.toLocaleString("es-DO");
  }
  return column.kind === "status" ? statusLabel(value) : value;
}
