import { describe, expect, it } from "vitest";
import { effectiveChannel, isEmailEnabled } from "@/lib/email/availability";

describe("correo opcional", () => {
  it("solo está activo si hay llave de Resend", () => {
    expect(isEmailEnabled({})).toBe(false);
    expect(isEmailEnabled({ RESEND_API_KEY: "" })).toBe(false);
    expect(isEmailEnabled({ RESEND_API_KEY: "   " })).toBe(false);
    expect(isEmailEnabled({ RESEND_API_KEY: "re_abc123" })).toBe(true);
  });

  it("sin correo, cualquier canal se convierte en WhatsApp", () => {
    expect(effectiveChannel("whatsapp", false)).toBe("whatsapp");
    expect(effectiveChannel("email", false)).toBe("whatsapp");
    expect(effectiveChannel("both", false)).toBe("whatsapp");
  });

  it("con correo se respeta el canal elegido", () => {
    expect(effectiveChannel("whatsapp", true)).toBe("whatsapp");
    expect(effectiveChannel("email", true)).toBe("email");
    expect(effectiveChannel("both", true)).toBe("both");
  });
});
