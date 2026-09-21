import { formatMoney } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const WHOLESALE_MESSAGE_MAX = 1800;

export interface WholesaleMessageLine {
  name: string;
  condition: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface WholesaleMessageInput {
  /** Código del pedido (PM-2026-0001): lo que el negocio busca en el panel. */
  code: string;
  lines: WholesaleMessageLine[];
  total: number;
  siteHost: string;
}

function lineBlock(line: WholesaleMessageLine, position: number): string {
  const condition = line.condition ? ` (${line.condition})` : "";
  return [
    `${position}) ${line.name}${condition}`,
    `   ${line.quantity} × ${formatMoney(line.unitPrice)} = ${formatMoney(line.lineTotal)}`,
  ].join("\n");
}

/** Mensaje del pedido al por mayor, con el código para que el negocio lo ubique. */
export function buildWholesaleMessage(input: WholesaleMessageInput): string {
  const header = "Hola, quiero hacer este pedido al por mayor:\n";
  const footer = [
    `*Total:* ${formatMoney(input.total)}`,
    "",
    `Pedido ${input.code} · enviado desde ${input.siteHost}`,
  ].join("\n");

  const blocks = input.lines.map((line, index) => lineBlock(line, index + 1));
  const assemble = (shown: string[], hidden: number): string => {
    const more =
      hidden > 0
        ? `\n\n... y ${hidden} ${hidden === 1 ? "producto más" : "productos más"} — ver pedido ${input.code}`
        : "";
    return `${header}\n${shown.join("\n\n")}${more}\n\n${footer}`;
  };

  const full = assemble(blocks, 0);
  if (full.length <= WHOLESALE_MESSAGE_MAX) return full;

  // Se quitan productos desde el final hasta que quepa; el pedido completo queda guardado.
  for (let shown = blocks.length - 1; shown >= 1; shown -= 1) {
    const candidate = assemble(blocks.slice(0, shown), blocks.length - shown);
    if (candidate.length <= WHOLESALE_MESSAGE_MAX) return candidate;
  }
  return assemble(blocks.slice(0, 1), blocks.length - 1);
}

export function buildWholesaleUrl(number: string, input: WholesaleMessageInput): string {
  return buildWhatsAppUrl(number, buildWholesaleMessage(input));
}
