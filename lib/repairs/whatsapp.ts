import { buildWhatsAppUrl } from "@/lib/whatsapp";

export interface RepairMessageInput {
  code: string;
  customerName: string;
  customerPhone: string;
  device: string;
  serviceName: string;
  issueDescription: string;
  siteHost: string;
}

export function buildRepairMessage(input: RepairMessageInput): string {
  return [
    "*NUEVA SOLICITUD DE REPARACIÓN — RAYMOND UNLOCK*",
    `Código: ${input.code}`,
    "",
    `*Cliente:* ${input.customerName}`,
    `*Teléfono:* ${input.customerPhone}`,
    `*Equipo:* ${input.device}`,
    `*Servicio:* ${input.serviceName}`,
    "",
    "*Problema:*",
    input.issueDescription,
    "",
    `Enviado desde ${input.siteHost}`,
  ].join("\n");
}

export function buildRepairWhatsAppUrl(number: string, input: RepairMessageInput): string {
  return buildWhatsAppUrl(number, buildRepairMessage(input));
}
