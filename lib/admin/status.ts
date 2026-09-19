import type { Enums } from "@/types/database";

export type RequestStatus = Enums<"quote_status">;

export const REQUEST_STATUSES: readonly RequestStatus[] = [
  "nueva",
  "contactada",
  "cotizada",
  "cerrada",
  "cancelada",
];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  nueva: "Nueva",
  contactada: "Contactada",
  cotizada: "Cotizada",
  cerrada: "Cerrada",
  cancelada: "Cancelada",
};

/** Clases de color para el badge de cada estado (contraste AA sobre su fondo). */
export const REQUEST_STATUS_CLASSES: Record<RequestStatus, string> = {
  nueva: "bg-brand-red-600 text-white",
  contactada: "bg-amber-100 text-amber-900",
  cotizada: "bg-blue-100 text-blue-900",
  cerrada: "bg-success-700/15 text-success-700",
  cancelada: "bg-muted text-muted-foreground",
};

export function isRequestStatus(value: string): value is RequestStatus {
  return REQUEST_STATUSES.some((status) => status === value);
}

/** Número para wa.me a partir de un teléfono dominicano guardado como 809-555-0101. */
export function customerWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `1${digits}` : digits;
}
