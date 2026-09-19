import { z } from "zod";
import { dominicanPhoneSchema } from "@/lib/validation/phone";
import { quoteChannelSchema } from "@/lib/validation/quote";

export const repairFormSchema = z
  .object({
    customerName: z.string().trim().min(2, "Ingresa tu nombre").max(100),
    customerPhone: dominicanPhoneSchema,
    customerEmail: z
      .string()
      .trim()
      .max(150)
      .optional()
      .transform((value) => (value === "" ? undefined : value))
      .pipe(z.email("Ingresa un correo válido").optional()),
    device: z.string().trim().min(2, "Indica el modelo de tu equipo").max(80),
    serviceId: z.string().trim().min(1, "Elige un servicio").max(100),
    issueDescription: z
      .string()
      .trim()
      .min(10, "Cuéntanos un poco más del problema")
      .max(1000, "Máximo 1000 caracteres"),
    channel: quoteChannelSchema,
    /** Campo trampa: las personas no lo ven ni lo llenan. */
    additionalInfo: z.string().max(0).optional(),
  })
  .refine((values) => values.channel === "whatsapp" || values.customerEmail !== undefined, {
    path: ["customerEmail"],
    message: "Ingresa tu correo para recibir la respuesta por correo",
  });

export type RepairFormInput = z.input<typeof repairFormSchema>;
export type RepairFormValues = z.output<typeof repairFormSchema>;
