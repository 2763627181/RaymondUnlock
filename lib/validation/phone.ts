import { z } from "zod";

const DOMINICAN_AREA_CODES = new Set(["809", "829", "849"]);

/**
 * Acepta teléfonos dominicanos con o sin código de país (1) y con cualquier
 * separador. Devuelve el formato 809-000-0000, o null si no es válido.
 */
export function normalizeDominicanPhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  if (!DOMINICAN_AREA_CODES.has(digits.slice(0, 3))) return null;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const dominicanPhoneSchema = z
  .string()
  .trim()
  .min(1, "Ingresa tu teléfono")
  .transform((value, ctx) => {
    const normalized = normalizeDominicanPhone(value);
    if (normalized === null) {
      ctx.addIssue({
        code: "custom",
        message: "Ingresa un teléfono dominicano válido (809, 829 o 849)",
      });
      return z.NEVER;
    }
    return normalized;
  });
