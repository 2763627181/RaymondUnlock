import { describe, expect, it } from "vitest";
import { normalizeRnc, newPasswordSchema, profileSchema, registerSchema } from "./auth";

const base = {
  accountType: "customer" as const,
  fullName: "Ana Pérez",
  email: "  ANA@Example.COM ",
  phone: "(809) 555-0101",
  password: "clave-segura-1",
};

describe("normalizeRnc", () => {
  it("acepta RNC de 9 dígitos y cédula de 11, ignorando separadores", () => {
    expect(normalizeRnc("1-30-12345-6")).toBe("130123456");
    expect(normalizeRnc("001-1234567-8")).toBe("00112345678");
  });
  it("rechaza otras longitudes", () => {
    expect(normalizeRnc("12345")).toBeNull();
    expect(normalizeRnc("")).toBeNull();
  });
});

describe("registerSchema", () => {
  it("normaliza correo y teléfono", () => {
    const result = registerSchema.parse(base);
    expect(result.email).toBe("ana@example.com");
    expect(result.phone).toBe("809-555-0101");
  });

  it("una cuenta mayorista exige el nombre del negocio", () => {
    const result = registerSchema.safeParse({ ...base, accountType: "wholesale" });
    expect(result.success).toBe(false);
    expect(
      registerSchema.safeParse({ ...base, accountType: "wholesale", businessName: "Celulares JP" })
        .success,
    ).toBe(true);
  });

  it("valida el RNC solo si se escribe", () => {
    expect(registerSchema.parse({ ...base, rnc: "" }).rnc).toBeUndefined();
    expect(registerSchema.parse({ ...base, rnc: "1-30-12345-6" }).rnc).toBe("130123456");
    expect(registerSchema.safeParse({ ...base, rnc: "123" }).success).toBe(false);
  });

  it("rechaza contraseñas cortas, teléfonos no dominicanos y el campo trampa lleno", () => {
    expect(registerSchema.safeParse({ ...base, password: "corta" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, phone: "305-555-0101" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, additionalInfo: "bot" }).success).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("exige que las contraseñas coincidan", () => {
    expect(
      newPasswordSchema.safeParse({ password: "clave-segura-1", confirm: "otra" }).success,
    ).toBe(false);
    expect(
      newPasswordSchema.safeParse({ password: "clave-segura-1", confirm: "clave-segura-1" })
        .success,
    ).toBe(true);
  });
});

describe("profileSchema", () => {
  it("deja vacíos los campos opcionales", () => {
    const result = profileSchema.parse({ fullName: "Ana", phone: "8095550101", businessName: "" });
    expect(result.businessName).toBeUndefined();
  });
});
