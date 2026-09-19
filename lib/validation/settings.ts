import { z } from "zod";
import { ICON_NAMES } from "@/lib/icons";

/**
 * Esquemas de las filas de `site_settings`. Los usa la tienda para leerlas y el
 * panel para validar lo que se guarda: una fila mal formada tumbaría el sitio,
 * así que el panel nunca puede escribir nada que la tienda no acepte.
 */

const text = (max: number, message = "Este campo es obligatorio") =>
  z.string().trim().min(1, message).max(max, `Máximo ${max} caracteres`);

const iconName = z.string().refine((value) => ICON_NAMES.includes(value), "Icono no válido");

export const iconCopySchema = z.object({
  icon: iconName,
  title: text(60),
  text: text(160),
});

export const businessSchema = z.object({
  businessName: text(80),
  tagline: text(80),
  description: text(300),
  address: text(200),
  addressParts: z.object({
    street: text(120),
    locality: text(80),
    postalCode: text(10),
    country: z.string().trim().length(2, "Código de 2 letras (DO)"),
  }),
  phoneDisplay: text(30),
  shippingNote: text(300),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{11,15}$/, "Solo dígitos con código de país (18099063114)"),
  email: z.string().trim().max(150).pipe(z.email("Ingresa un correo válido")),
  instagramUrl: z.string().trim().max(300).pipe(z.url("Ingresa una URL válida")),
  threadsUrl: z.string().trim().max(300).pipe(z.url("Ingresa una URL válida")),
  /** Vacío = no se muestra el enlace de Facebook. */
  facebookUrl: z
    .string()
    .trim()
    .max(300)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null))
    .pipe(
      z
        .string()
        .regex(/^https:\/\//, "Debe empezar con https://")
        .nullable(),
    ),
});

export const stepSchema = z.object({ title: text(60), text: text(160) });
export const testimonialSchema = z.object({
  id: z.string().trim().min(1).max(40),
  name: text(60),
  detail: text(80),
  quote: text(400),
});
export const navPromoSchema = z.object({ title: text(60), subtitle: text(100), href: text(200) });
export const hourSchema = z.object({ label: text(40), value: text(60) });

export const guaranteesSchema = z.array(iconCopySchema).max(6);
export const whyUsSchema = z.array(iconCopySchema).max(6);
export const repairProcessSchema = z.array(stepSchema).max(6);
export const testimonialsSchema = z.array(testimonialSchema).max(12);
export const navPromosSchema = z.record(z.string(), navPromoSchema);
export const hoursSchema = z.array(hourSchema).max(10);

export const SETTING_SCHEMAS = {
  business: businessSchema,
  guarantees: guaranteesSchema,
  why_us: whyUsSchema,
  repair_process: repairProcessSchema,
  testimonials: testimonialsSchema,
  nav_promos: navPromosSchema,
  hours: hoursSchema,
} as const;

export type SettingKey = keyof typeof SETTING_SCHEMAS;

export function isSettingKey(value: string): value is SettingKey {
  return value in SETTING_SCHEMAS;
}
