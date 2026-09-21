import { describe, expect, it } from "vitest";
import { loginSchema } from "./auth";

describe("loginSchema", () => {
  it("normaliza el correo (recorta y pasa a minúsculas)", () => {
    const result = loginSchema.parse({ email: "  RAYMOND@Gmail.COM ", password: "x" });
    expect(result.email).toBe("raymond@gmail.com");
  });

  it("rechaza correo inválido, contraseña vacía o demasiado larga", () => {
    expect(loginSchema.safeParse({ email: "no-es-correo", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x".repeat(73) }).success).toBe(
      false,
    );
  });
});
