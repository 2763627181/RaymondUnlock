export function buildWhatsAppUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildProductInquiryMessage(input: {
  productName: string;
  variantLabel: string | null;
  priceLabel: string;
  productUrl: string;
}): string {
  const lines = [
    "Hola, quiero consultar por este producto de Raymond Unlock:",
    "",
    `*${input.productName}*`,
    ...(input.variantLabel ? [input.variantLabel] : []),
    `Precio: ${input.priceLabel}`,
    input.productUrl,
    "",
    "¿Lo tienen disponible?",
  ];
  return lines.join("\n");
}
