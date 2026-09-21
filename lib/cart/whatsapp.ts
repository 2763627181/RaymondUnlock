import type { PricedLine } from "@/lib/cart/pricing";
import { formatMoney } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const WHATSAPP_MAX_LENGTH = 1800;

export interface QuoteMessageInput {
  code: string;
  customerName: string;
  customerPhone: string;
  businessName?: string | undefined;
  lines: PricedLine[];
  subtotal: number;
  note?: string | undefined;
  siteHost: string;
}

function itemBlock(line: PricedLine, position: number): string {
  const lines = [`${position}) ${line.productName}`];
  if (line.variantLabel) lines.push(`   ${line.variantLabel}`);
  lines.push(
    `   Cantidad: ${line.quantity} × ${formatMoney(line.unitPrice)} = ${formatMoney(line.lineTotal)}`,
  );
  return lines.join("\n");
}

export function buildQuoteMessage(input: QuoteMessageInput): string {
  const header = [
    "*NUEVA COTIZACIÓN — RAYMOND UNLOCK*",
    `Código: ${input.code}`,
    "",
    `*Cliente:* ${input.customerName}`,
    `*Teléfono:* ${input.customerPhone}`,
    ...(input.businessName ? [`*Negocio:* ${input.businessName}`] : []),
    "",
    "*ARTÍCULOS*",
  ].join("\n");

  const footer = [
    `*Subtotal:* ${formatMoney(input.subtotal)}`,
    "_Precios sujetos a confirmación y disponibilidad._",
    ...(input.note ? ["", `*Nota del cliente:* ${input.note}`] : []),
    "",
    `Enviado desde ${input.siteHost}`,
  ].join("\n");

  const blocks = input.lines.map((line, index) => itemBlock(line, index + 1));
  const assemble = (shown: string[], hidden: number): string => {
    const items = shown.join("\n\n");
    const more =
      hidden > 0
        ? `\n\n... y ${hidden} ${hidden === 1 ? "artículo más" : "artículos más"} — ver código ${input.code}`
        : "";
    return `${header}\n${items}${more}\n\n${footer}`;
  };

  const full = assemble(blocks, 0);
  if (full.length <= WHATSAPP_MAX_LENGTH) return full;

  // Se quitan artículos desde el final hasta que quepa; el pedido completo
  // queda guardado y llega por correo.
  for (let shown = blocks.length - 1; shown >= 1; shown -= 1) {
    const candidate = assemble(blocks.slice(0, shown), blocks.length - shown);
    if (candidate.length <= WHATSAPP_MAX_LENGTH) return candidate;
  }
  return assemble(blocks.slice(0, 1), blocks.length - 1);
}

export function buildQuoteWhatsAppUrl(number: string, input: QuoteMessageInput): string {
  return buildWhatsAppUrl(number, buildQuoteMessage(input));
}
