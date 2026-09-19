import { beforeEach, describe, expect, it } from "vitest";
import { allowAttempt, resetRateLimits } from "./rate-limit";

const options = { limit: 3, windowMs: 1000 };

describe("allowAttempt", () => {
  beforeEach(resetRateLimits);

  it("permite hasta el límite y bloquea el siguiente intento", () => {
    expect([1, 2, 3, 4].map(() => allowAttempt("ip", options, 0))).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  it("libera el cupo cuando pasa la ventana", () => {
    for (let i = 0; i < 3; i += 1) allowAttempt("ip", options, 0);
    expect(allowAttempt("ip", options, 500)).toBe(false);
    expect(allowAttempt("ip", options, 1001)).toBe(true);
  });

  it("cuenta cada clave por separado", () => {
    for (let i = 0; i < 3; i += 1) allowAttempt("a", options, 0);
    expect(allowAttempt("b", options, 0)).toBe(true);
  });
});
