import { describe, expect, it } from "vitest";
import { safeNextPath } from "./paths";
import { accountStatus, isWholesaleEligible } from "./status";

describe("accountStatus", () => {
  it("distingue mayorista pendiente, aprobado y rechazado", () => {
    expect(accountStatus({ role: "wholesale", approved: false, reviewedAt: null })).toBe(
      "wholesale_pending",
    );
    expect(accountStatus({ role: "wholesale", approved: true, reviewedAt: "2026-09-19" })).toBe(
      "wholesale",
    );
    expect(accountStatus({ role: "customer", approved: false, reviewedAt: "2026-09-19" })).toBe(
      "wholesale_rejected",
    );
    expect(accountStatus({ role: "customer", approved: false, reviewedAt: null })).toBe("customer");
    expect(accountStatus({ role: "admin", approved: false, reviewedAt: null })).toBe("admin");
  });
});

describe("isWholesaleEligible", () => {
  it("solo mayoristas aprobados y admins ven precio al por mayor", () => {
    expect(isWholesaleEligible("wholesale")).toBe(true);
    expect(isWholesaleEligible("admin")).toBe(true);
    for (const status of ["customer", "wholesale_pending", "wholesale_rejected"] as const) {
      expect(isWholesaleEligible(status)).toBe(false);
    }
  });
});

describe("safeNextPath", () => {
  it("acepta rutas internas y descarta redirecciones abiertas", () => {
    expect(safeNextPath("/admin/productos?page=2")).toBe("/admin/productos?page=2");
    expect(safeNextPath("//evil.com")).toBe("/cuenta");
    expect(safeNextPath("https://evil.com")).toBe("/cuenta");
    expect(safeNextPath(String.raw`/\evil.com`)).toBe("/cuenta");
    expect(safeNextPath(null)).toBe("/cuenta");
    expect(safeNextPath("/login")).toBe("/cuenta");
    expect(safeNextPath("/auth/confirm?x=1")).toBe("/cuenta");
    expect(safeNextPath("relativo")).toBe("/cuenta");
  });
});
