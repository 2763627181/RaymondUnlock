import type { PricedLine } from "@/lib/cart/pricing";
import { CONDITION_LABELS } from "@/lib/catalog/text";
import { formatMoney } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const WHATSAPP_MAX_LENGTH = 1800;

export interface QuoteMessageInput {
  /** Código de la cotización (RU-2026-0001): lo que el negocio busca en el panel. */
  code: string;
  customerName: string;
  customerPhone: string;
  lines: PricedLine[];
  subtotal: number;
  note?: string | undefined;
  siteHost: string;
}

function itemBlock(line: PricedLine, position: number): string {
  const condition = line.condition === "nuevo" ? "" : ` (${CONDITION_LABELS[line.condition]})`;
  const lines = [`${position}) ${line.productName}${condition}`];
  if (line.variantLabel) lines.push(`   ${line.variantLabel}`);
  if (line.code) lines.push(`   Código: ${line.code}`);
  lines.push(
    `   Cantidad: ${line.quantity} × ${formatMoney(line.unitPrice)} = ${formatMoney(line.lineTotal)}`,
  );
  return lines.join("\n");
}

/**
 * Mensaje del cliente al negocio, en primera persona: "Hola, mi nombre es … y
 * estoy interesado en …", con cada equipo (estado, batería, liberación) y su código.
 */
export function buildQuoteMessage(input: QuoteMessageInput): string {
  const interest = input.lines.length === 1 ? "este producto" : "estos productos";
  const header = `Hola, mi nombre es ${input.customerName} y estoy interesado en ${interest} de Raymond Unlock:\n`;

  const footer = [
    `*Subtotal:* ${formatMoney(input.subtotal)}`,
    "_Precios sujetos a confirmación y disponibilidad._",
    "",
    `Mi teléfono: ${input.customerPhone}`,
    ...(input.note ? [`Nota: ${input.note}`] : []),
    "",
    `Cotización ${input.code} · enviada desde ${input.siteHost}`,
  ].join("\n");

  const blocks = input.lines.map((line, index) => itemBlock(line, index + 1));
  const assemble = (shown: string[], hidden: number): string => {
    const items = shown.join("\n\n");
    const more =
      hidden > 0
        ? `\n\n... y ${hidden} ${hidden === 1 ? "artículo más" : "artículos más"} — ver cotización ${input.code}`
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
