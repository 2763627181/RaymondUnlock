import { unitFacts, type UnitFacts } from "@/lib/catalog/unit-facts";

export function buildWhatsAppUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export interface ProductInquiry {
  productName: string;
  facts: UnitFacts;
  priceLabel: string;
  productUrl: string;
}

/**
 * Mensaje predeterminado al pedir un producto por WhatsApp: el equipo exacto que
 * el cliente eligió (estado, batería, liberación, código…) para que el negocio
 * sepa de cuál se trata sin preguntar.
 */
export function buildProductInquiryMessage(input: ProductInquiry): string {
  return [
    "Hola, quiero información sobre este producto de Raymond Unlock:",
    "",
    `*${input.productName}*`,
    ...unitFacts(input.facts).map((fact) => `• ${fact.label}: ${fact.value}`),
    `• Precio: ${input.priceLabel}`,
    "",
    input.productUrl,
    "",
    "¿Lo tienen disponible?",
  ].join("\n");
}
