import { z } from "zod";
import { isAllowedImageUrl } from "@/lib/admin/image-url";
import { optionalMoney, optionalText } from "./common";
import { iconSchema, slugSchema } from "./taxonomy";

/** Enlaces internos ("/tienda/audio") o https; nunca javascript: ni otros esquemas. */
function isSafeLink(value: string): boolean {
  return /^\/(?!\/)/.test(value) || /^https:\/\//.test(value);
}

export const serviceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Ingresa el nombre").max(80, "Máximo 80 caracteres"),
  slug: slugSchema,
  description: optionalText(400),
  icon: iconSchema,
  priceFrom: optionalMoney,
  turnaround: optionalText(60),
  /** Se escribe separado por comas ("iPhone, Samsung"); acepta también la lista ya separada. */
  deviceTypes: z
    .union([z.string().max(300, "Máximo 300 caracteres"), z.array(z.string())])
    .transform((value) =>
      (typeof value === "string" ? value.split(",") : value)
        .map((item) => item.trim())
        .filter((item) => item !== ""),
    )
    .pipe(z.array(z.string().max(40, "Cada equipo, máximo 40 caracteres")).max(12)),
  isActive: z.boolean(),
});

const linkSchema = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().refine(isSafeLink, "Usa /ruta o https://…").optional());

export const bannerSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(2, "Ingresa el título").max(80, "Máximo 80 caracteres"),
  subtitle: optionalText(160),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Sube la imagen")
    .max(500)
    .refine(
      isAllowedImageUrl,
      "Sube la imagen desde aquí (o usa una ruta del sitio, como /seed/hero.svg)",
    ),
  ctaLabel: optionalText(40),
  ctaHref: linkSchema,
  theme: z.enum(["dark", "light"]),
  isActive: z.boolean(),
});

export type ServiceInput = z.input<typeof serviceSchema>;
export type ServiceValues = z.output<typeof serviceSchema>;
export type BannerInput = z.input<typeof bannerSchema>;
export type BannerValues = z.output<typeof bannerSchema>;
