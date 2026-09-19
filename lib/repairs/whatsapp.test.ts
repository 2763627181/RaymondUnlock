import { describe, expect, it } from "vitest";
import { buildRepairMessage, buildRepairWhatsAppUrl } from "@/lib/repairs/whatsapp";

const input = {
  code: "RE-2026-0001",
  customerName: "Ana Gómez",
  customerPhone: "829-555-0101",
  device: "iPhone 13",
  serviceName: "Cambio de pantalla",
  issueDescription: "Se rompió la pantalla\ny no responde el tacto",
  siteHost: "raymondunlock.com",
};

describe("buildRepairMessage", () => {
  it("incluye todos los datos de la solicitud", () => {
    const message = buildRepairMessage(input);
    expect(message.split("\n")[0]).toBe("*NUEVA SOLICITUD DE REPARACIÓN — RAYMOND UNLOCK*");
    expect(message).toContain("Código: RE-2026-0001");
    expect(message).toContain("*Equipo:* iPhone 13");
    expect(message).toContain("*Servicio:* Cambio de pantalla");
    expect(message).toContain("*Problema:*\nSe rompió la pantalla\ny no responde el tacto");
    expect(message.endsWith("Enviado desde raymondunlock.com")).toBe(true);
  });
});

describe("buildRepairWhatsAppUrl", () => {
  it("apunta al número del negocio con saltos de línea codificados", () => {
    const url = buildRepairWhatsAppUrl("18099063114", input);
    expect(url.startsWith("https://wa.me/18099063114?text=")).toBe(true);
    expect(url).toContain("%0A");
  });
});
