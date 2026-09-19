import { z } from "zod";

const MAX_MONEY = 99_999_999.99;

/** Los formularios dan texto y el servidor recibe ya números: se aceptan los dos. */
function parseNumber(value: string | number): number | undefined {
  if (typeof value === "number") return value;
  const text = value.trim().replace(/,/g, "");
  return text === "" ? undefined : Number(text);
}

export const money = z.union([z.string(), z.number()]).transform((value, ctx): number => {
  const parsed = parseNumber(value);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed < 0 || parsed > MAX_MONEY) {
    ctx.addIssue({ code: "custom", message: "Ingresa un monto válido" });
    return z.NEVER;
  }
  return Math.round(parsed * 100) / 100;
});

export const optionalMoney = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value, ctx): number | undefined => {
    if (value === undefined) return undefined;
    const parsed = parseNumber(value);
    if (parsed === undefined) return undefined;
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_MONEY) {
      ctx.addIssue({ code: "custom", message: "Ingresa un monto válido" });
      return z.NEVER;
    }
    return Math.round(parsed * 100) / 100;
  });

export function integer(min: number, max: number, message: string) {
  return z.union([z.string(), z.number()]).transform((value, ctx): number => {
    const parsed = parseNumber(value);
    if (parsed === undefined || !Number.isInteger(parsed) || parsed < min || parsed > max) {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    }
    return parsed;
  });
}

export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((value) => (value === "" ? undefined : value))
    .optional();
}

/** "" (opción vacía de un select) se guarda como null. Acepta también su propia salida (null). */
export const nullableUuid = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => (value ? value.trim() || null : null))
  .pipe(z.uuid("Selección no válida").nullable());
