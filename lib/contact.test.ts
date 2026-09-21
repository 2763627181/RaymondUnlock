import { describe, expect, it } from "vitest";
import { contactPhones, phonesLine, telHref } from "@/lib/contact";

const base = { phoneDisplay: "809-906-3114", whatsappNumber: "18099063114" };

describe("teléfonos del negocio", () => {
  it("telHref arma el enlace con código de país desde cualquier formato", () => {
    expect(telHref("829-688-3114")).toBe("tel:+18296883114");
    expect(telHref("(829) 688-3114")).toBe("tel:+18296883114");
    expect(telHref("18296883114")).toBe("tel:+18296883114");
  });

  it("sin teléfono local solo sale el celular", () => {
    expect(contactPhones({ ...base, localPhone: null })).toEqual([
      { label: "Cel", display: "809-906-3114", href: "tel:+18099063114" },
    ]);
    expect(phonesLine({ ...base, localPhone: null })).toBe("Cel 809-906-3114");
  });

  it("con teléfono local salen los dos, primero el celular", () => {
    expect(contactPhones({ ...base, localPhone: "829-688-3114" })).toEqual([
      { label: "Cel", display: "809-906-3114", href: "tel:+18099063114" },
      { label: "Local", display: "829-688-3114", href: "tel:+18296883114" },
    ]);
    expect(phonesLine({ ...base, localPhone: "829-688-3114" })).toBe(
      "Cel 809-906-3114 · Local 829-688-3114",
    );
  });
});
