import { z } from "zod";
import { dominicanPhoneSchema } from "@/lib/validation/phone";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(150, "Máximo 150 caracteres")
  .pipe(z.email("Ingresa un correo válido"));

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres");

/** RNC (9 dígitos) o cédula (11): se guarda solo con dígitos. */
export function normalizeRnc(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return digits.length === 9 || digits.length === 11 ? digits : null;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

const optionalRncSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (value === undefined || value === "") return undefined;
    const normalized = normalizeRnc(value);
    if (normalized === null) {
      ctx.addIssue({ code: "custom", message: "El RNC tiene 9 dígitos (o 11 si es cédula)" });
      return z.NEVER;
    }
    return normalized;
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña").max(72),
  next: z.string().max(300).optional(),
});

export const accountTypeSchema = z.enum(["customer", "wholesale"]);

export const registerSchema = z
  .object({
    accountType: accountTypeSchema,
    fullName: z.string().trim().min(2, "Ingresa tu nombre").max(100),
    email: emailSchema,
    phone: dominicanPhoneSchema,
    password: passwordSchema,
    businessName: optionalText(120),
    rnc: optionalRncSchema,
    estimatedVolume: optionalText(200),
    /** Campo trampa: las personas no lo ven ni lo llenan. */
    additionalInfo: z.string().max(0).optional(),
  })
  .refine((values) => values.accountType !== "wholesale" || values.businessName !== undefined, {
    path: ["businessName"],
    message: "Ingresa el nombre de tu negocio",
  });

export const recoverSchema = z.object({
  email: emailSchema,
  additionalInfo: z.string().max(0).optional(),
});

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa tu nombre").max(120),
  phone: dominicanPhoneSchema,
  businessName: optionalText(120),
  rnc: optionalRncSchema,
});

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;
export type RecoverInput = z.input<typeof recoverSchema>;
export type NewPasswordInput = z.input<typeof newPasswordSchema>;
export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileValues = z.output<typeof profileSchema>;

/** Un cliente que ya tiene cuenta pide acceso al por mayor. */
export const wholesaleRequestSchema = z.object({
  businessName: z.string().trim().min(2, "Ingresa el nombre de tu negocio").max(120),
  rnc: optionalRncSchema,
  estimatedVolume: optionalText(200),
});

export type WholesaleRequestInput = z.input<typeof wholesaleRequestSchema>;
export type WholesaleRequestValues = z.output<typeof wholesaleRequestSchema>;
