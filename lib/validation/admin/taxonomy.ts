import { z } from "zod";
import { ICON_NAMES } from "@/lib/icons";
import { SLUG_PATTERN } from "@/lib/admin/slug";
import { nullableUuid, optionalText } from "./common";

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Ingresa el slug")
  .max(80, "Máximo 80 caracteres")
  .regex(SLUG_PATTERN, "Solo minúsculas, números y guiones");

const name = z.string().trim().min(2, "Ingresa el nombre").max(80, "Máximo 80 caracteres");

export const iconSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(
    z
      .string()
      .refine((value) => ICON_NAMES.includes(value), "Icono no válido")
      .optional(),
  );

export const categorySchema = z.object({
  id: z.uuid().optional(),
  name,
  slug: slugSchema,
  description: optionalText(300),
  icon: iconSchema,
  parentId: nullableUuid,
  isActive: z.boolean(),
});

export const brandSchema = z.object({
  id: z.uuid().optional(),
  name,
  slug: slugSchema,
});

export const reorderSchema = z.object({ ids: z.array(z.uuid()).min(1).max(200) });

export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryValues = z.output<typeof categorySchema>;
export type BrandInput = z.input<typeof brandSchema>;
export type BrandValues = z.output<typeof brandSchema>;
