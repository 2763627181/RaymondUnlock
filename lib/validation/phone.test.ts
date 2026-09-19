import { describe, expect, it } from "vitest";
import { dominicanPhoneSchema, normalizeDominicanPhone } from "@/lib/validation/phone";

describe("normalizeDominicanPhone", () => {
  it.each([
    ["809-906-3114", "809-906-3114"],
    ["8099063114", "809-906-3114"],
    ["(829) 555 0101", "829-555-0101"],
    ["+1 849 555 0102", "849-555-0102"],
    ["18099063114", "809-906-3114"],
  ])("normaliza %s", (input, expected) => {
    expect(normalizeDominicanPhone(input)).toBe(expected);
  });

  it.each(["", "abc", "12345", "305-555-0100", "809-906-311", "809-906-31144"])(
    "rechaza %s",
    (input) => {
      expect(normalizeDominicanPhone(input)).toBeNull();
    },
  );
});

describe("dominicanPhoneSchema", () => {
  it("devuelve el teléfono normalizado", () => {
    expect(dominicanPhoneSchema.parse(" 8099063114 ")).toBe("809-906-3114");
  });

  it("da un mensaje en español cuando es inválido", () => {
    const result = dominicanPhoneSchema.safeParse("123");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/teléfono dominicano válido/);
  });
});
