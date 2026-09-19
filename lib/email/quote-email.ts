import type { PricedLine } from "@/lib/cart/pricing";
import { emailLayout, escapeHtml } from "@/lib/email/html";
import { formatMoney } from "@/lib/format";
import type { PriceTier } from "@/types/catalog";

export interface QuoteEmailData {
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | undefined;
  businessName?: string | undefined;
  note?: string | undefined;
  tier: PriceTier;
  lines: PricedLine[];
  subtotal: number;
}

const cell = "padding:8px 6px;border-bottom:1px solid #e6e8ec;font-size:14px;vertical-align:top;";

function itemsTable(lines: PricedLine[], subtotal: number): string {
  const rows = lines
    .map(
      (line) => `<tr>
<td style="${cell}">${escapeHtml(line.productName)}${
        line.variantLabel
          ? `<br><span style="color:#6b7280;font-size:13px;">${escapeHtml(line.variantLabel)}</span>`
          : ""
      }</td>
<td style="${cell}text-align:center;">${line.quantity}</td>
<td style="${cell}text-align:right;white-space:nowrap;">${formatMoney(line.unitPrice)}</td>
<td style="${cell}text-align:right;white-space:nowrap;">${formatMoney(line.lineTotal)}</td>
</tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
<tr>
<th style="${cell}text-align:left;color:#6b7280;font-weight:600;">Artículo</th>
<th style="${cell}text-align:center;color:#6b7280;font-weight:600;">Cant.</th>
<th style="${cell}text-align:right;color:#6b7280;font-weight:600;">Precio</th>
<th style="${cell}text-align:right;color:#6b7280;font-weight:600;">Total</th>
</tr>
${rows}
<tr><td colspan="3" style="padding:12px 6px;text-align:right;font-weight:700;">Subtotal</td>
<td style="padding:12px 6px;text-align:right;font-weight:700;white-space:nowrap;">${formatMoney(subtotal)}</td></tr>
</table>`;
}

function detailRow(label: string, value: string): string {
  return `<tr><td style="padding:3px 12px 3px 0;color:#6b7280;font-size:14px;">${label}</td><td style="padding:3px 0;font-size:14px;">${escapeHtml(value)}</td></tr>`;
}

/** Aviso interno para el negocio. */
export function renderQuoteNotificationEmail(data: QuoteEmailData): {
  subject: string;
  html: string;
} {
  const details = [
    detailRow("Cliente", data.customerName),
    detailRow("Teléfono", data.customerPhone),
    ...(data.customerEmail ? [detailRow("Correo", data.customerEmail)] : []),
    ...(data.businessName ? [detailRow("Negocio", data.businessName)] : []),
    detailRow("Tipo de precio", data.tier === "wholesale" ? "Al por mayor" : "Unidad"),
  ].join("");

  const note = data.note
    ? `<p style="margin:20px 0 0;font-size:14px;"><strong>Nota del cliente:</strong><br>${escapeHtml(data.note).replace(/\n/g, "<br>")}</p>`
    : "";

  return {
    subject: `Nueva cotización ${data.code} — ${data.customerName}`,
    html: emailLayout({
      title: `Nueva cotización ${data.code}`,
      preheader: `${data.customerName} pidió una cotización por ${formatMoney(data.subtotal)}`,
      body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${details}</table>
${itemsTable(data.lines, data.subtotal)}
${note}`,
    }),
  };
}

/** Copia de confirmación para el cliente. */
export function renderQuoteConfirmationEmail(
  data: QuoteEmailData,
  contact: { phoneDisplay: string; address: string },
): { subject: string; html: string } {
  return {
    subject: `Recibimos tu cotización ${data.code}`,
    html: emailLayout({
      title: `Gracias, ${data.customerName}. Recibimos tu cotización.`,
      preheader: `Tu código es ${data.code}`,
      body: `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Tu código de cotización es <strong>${escapeHtml(data.code)}</strong>. Te contactaremos para confirmar disponibilidad y precios.</p>
${itemsTable(data.lines, data.subtotal)}
<p style="margin:20px 0 0;font-size:13px;color:#6b7280;">Precios sujetos a confirmación y disponibilidad.</p>
<p style="margin:20px 0 0;font-size:14px;line-height:1.6;">Raymond Unlock<br>${escapeHtml(contact.address)}<br>WhatsApp / teléfono: ${escapeHtml(contact.phoneDisplay)}</p>`,
    }),
  };
}
