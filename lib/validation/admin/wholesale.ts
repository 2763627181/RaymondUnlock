import { z } from "zod";
import { isAllowedImageUrl } from "@/lib/admin/image-url";
import { money, optionalText } from "./common";

const required = (max: number, empty: string) =>
  z.string().trim().min(1, empty).max(max, `Máximo ${max} caracteres`);

export const wholesaleProductSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Ingresa el nombre").max(160, "Máximo 160 caracteres"),
  type: required(40, "Ingresa el tipo (ej. Celulares)"),
  category: required(80, "Ingresa la categoría (ej. M-HORSE)"),
  condition: required(40, "Ingresa la condición (ej. Nuevo)"),
  price: money,
  /** Opcional: sin foto la lista muestra un icono. Solo rutas del sitio o nuestro bucket. */
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(
      z
        .string()
        .refine(isAllowedImageUrl, "Sube la imagen desde aquí (o usa una ruta del sitio)")
        .optional(),
    ),
  isActive: z.boolean(),
});

/** "809-712-3062", "+1 (809) 712-3062" o "18097123062" → "18097123062". Acepta su propia salida. */
const whatsapp = z
  .string()
  .trim()
  .transform((value, ctx): string => {
    const digits = value.replace(/\D/g, "");
    const full = digits.length === 10 ? `1${digits}` : digits;
    if (!/^\d{11,15}$/.test(full)) {
      ctx.addIssue({ code: "custom", message: "Ingresa el número completo (ej. 809-712-3062)" });
      return z.NEVER;
    }
    return full;
  });

export const wholesaleContactSchema = z.object({
  id: z.uuid().optional(),
  label: required(40, "Ingresa cómo se llama (ej. Ventas 1)"),
  personName: optionalText(60),
  whatsapp,
  isActive: z.boolean(),
});

export type WholesaleProductInput = z.input<typeof wholesaleProductSchema>;
export type WholesaleProductValues = z.output<typeof wholesaleProductSchema>;
export type WholesaleContactInput = z.input<typeof wholesaleContactSchema>;
export type WholesaleContactValues = z.output<typeof wholesaleContactSchema>;
