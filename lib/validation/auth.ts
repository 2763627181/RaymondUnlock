import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(150, "Máximo 150 caracteres")
  .pipe(z.email("Ingresa un correo válido"));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña").max(72),
  next: z.string().max(300).optional(),
});

export type LoginInput = z.input<typeof loginSchema>;
