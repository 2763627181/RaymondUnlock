import { describe, expect, it } from "vitest";
import { buildProductInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const input = {
  productName: "iPhone 13",
  facts: {
    condition: "usado" as const,
    capacity: "128 GB",
    color: "Azul",
    batteryHealth: 92,
    unlockType: "factory" as const,
    code: "RU-00012",
  },
  priceLabel: "RD$ 32,500.00",
  productUrl: "https://raymondunlock.com/producto/iphone-13",
};

describe("buildProductInquiryMessage", () => {
  it("incluye el equipo exacto: nombre, estado, batería, liberación y código", () => {
    expect(buildProductInquiryMessage(input)).toBe(
      [
        "Hola, estoy interesado en este producto de Raymond Unlock:",
        "",
        "*iPhone 13*",
        "• Estado: Usado",
        "• Capacidad: 128 GB",
        "• Color: Azul",
        "• Batería: 92 %",
        "• Liberación: Factory",
        "• Código: RU-00012",
        "• Precio: RD$ 32,500.00",
        "",
        "https://raymondunlock.com/producto/iphone-13",
        "",
        "¿Lo tienen disponible?",
      ].join("\n"),
    );
  });

  it("un accesorio nuevo no inventa batería ni liberación", () => {
    const message = buildProductInquiryMessage({
      ...input,
      productName: "Cable USB-C",
      facts: {
        ...input.facts,
        condition: "nuevo",
        capacity: null,
        batteryHealth: null,
        unlockType: null,
      },
    });
    expect(message).toContain("• Estado: Nuevo");
    expect(message).not.toContain("Batería");
    expect(message).not.toContain("Liberación");
  });
});

describe("buildWhatsAppUrl", () => {
  it("codifica saltos de línea y apunta al número", () => {
    const url = buildWhatsAppUrl("18099063114", buildProductInquiryMessage(input));
    expect(url.startsWith("https://wa.me/18099063114?text=")).toBe(true);
    expect(url).toContain("%0A");
    expect(url).toContain(encodeURIComponent("Liberación: Factory"));
  });
});
