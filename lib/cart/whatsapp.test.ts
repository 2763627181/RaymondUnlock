import { describe, expect, it } from "vitest";
import {
  WHATSAPP_MAX_LENGTH,
  buildQuoteMessage,
  buildQuoteWhatsAppUrl,
  type QuoteMessageInput,
} from "@/lib/cart/whatsapp";
import type { PricedLine } from "@/lib/cart/pricing";
import { formatMoney } from "@/lib/format";

function line(index: number, overrides: Partial<PricedLine> = {}): PricedLine {
  return {
    variantId: `v${index}`,
    productName: `Producto ${index}`,
    productSlug: `producto-${index}`,
    variantLabel: "128 GB · Titanio natural",
    condition: "nuevo",
    code: null,
    quantity: 2,
    unitPrice: 1000,
    lineTotal: 2000,
    ...overrides,
  };
}

const base: QuoteMessageInput = {
  code: "RU-2026-0001",
  customerName: "Juan Pérez",
  customerPhone: "809-000-0000",
  lines: [line(1), line(2, { variantLabel: null, quantity: 1, lineTotal: 1000 })],
  subtotal: 3000,
  siteHost: "raymondunlock.com",
};

describe("buildQuoteMessage", () => {
  it("empieza como lo diría el cliente: su nombre y lo que le interesa", () => {
    const message = buildQuoteMessage(base);
    const lines = message.split("\n");

    expect(lines[0]).toBe(
      "Hola, mi nombre es Juan Pérez y estoy interesado en estos productos de Raymond Unlock:",
    );
    expect(message).toContain("1) Producto 1\n   128 GB · Titanio natural\n   Cantidad: 2 ×");
    expect(message).toContain(`= ${formatMoney(2000)}`);
    expect(message).toContain(`*Subtotal:* ${formatMoney(3000)}`);
    expect(message).toContain("_Precios sujetos a confirmación y disponibilidad._");
    expect(message).toContain("Mi teléfono: 809-000-0000");
    expect(lines.at(-1)).toBe("Cotización RU-2026-0001 · enviada desde raymondunlock.com");
  });

  it("con un solo producto dice 'este producto'", () => {
    const [only] = base.lines;
    const message = buildQuoteMessage({ ...base, lines: only ? [only] : [] });
    expect(message.split("\n")[0]).toBe(
      "Hola, mi nombre es Juan Pérez y estoy interesado en este producto de Raymond Unlock:",
    );
  });

  it("de un equipo usado muestra estado, batería, liberación y código", () => {
    const message = buildQuoteMessage({
      ...base,
      lines: [
        line(1, {
          productName: "iPhone 13",
          condition: "usado",
          variantLabel: "128 GB · Azul · Batería 92 % · Factory",
          code: "RU-00012",
        }),
      ],
    });
    expect(message).toContain(
      "1) iPhone 13 (Usado)\n   128 GB · Azul · Batería 92 % · Factory\n   Código: RU-00012\n   Cantidad: 2 ×",
    );
  });

  it("omite la línea de variante cuando el producto no tiene", () => {
    const message = buildQuoteMessage(base);
    expect(message).toContain("2) Producto 2\n   Cantidad: 1 ×");
  });

  it("incluye la nota solo si existe", () => {
    expect(buildQuoteMessage({ ...base, note: "Necesito factura" })).toContain(
      "Nota: Necesito factura",
    );
    expect(buildQuoteMessage(base)).not.toContain("Nota:");
  });

  it("recorta la lista y avisa cuántos artículos faltan cuando excede el límite", () => {
    const many = Array.from({ length: 40 }, (_, index) => line(index + 1));
    const message = buildQuoteMessage({ ...base, lines: many, subtotal: 80000 });

    expect(message.length).toBeLessThanOrEqual(WHATSAPP_MAX_LENGTH);
    expect(message).toMatch(/\.\.\. y \d+ artículos más — ver cotización RU-2026-0001/);
    expect(message).toContain(`*Subtotal:* ${formatMoney(80000)}`);
    expect(message).toContain("1) Producto 1");
    expect(message).not.toContain("40) Producto 40");
  });

  it("no recorta un pedido que cabe", () => {
    expect(buildQuoteMessage(base)).not.toContain("artículos más");
  });
});

describe("buildQuoteWhatsAppUrl", () => {
  it("codifica saltos de línea reales y apunta al número del negocio", () => {
    const url = buildQuoteWhatsAppUrl("18099063114", base);
    expect(url.startsWith("https://wa.me/18099063114?text=")).toBe(true);
    expect(url).toContain("%0A");
    expect(url).not.toContain("\n");
    expect(decodeURIComponent(url.split("?text=")[1] ?? "")).toBe(buildQuoteMessage(base));
  });
});
