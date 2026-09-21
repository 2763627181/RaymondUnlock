import { z } from "zod";
import { MAX_LINE_QUANTITY, MAX_QUOTE_ITEMS } from "@/lib/cart/constants";
import { dominicanPhoneSchema } from "@/lib/validation/phone";

export const quoteChannelSchema = z.enum(["whatsapp", "email", "both"]);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((value) => (value === "" ? undefined : value))
    .optional();

/** Campos del formulario (los que llena el cliente). */
export const quoteFormSchema = z
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
    note: optionalText(500),
    channel: quoteChannelSchema,
    /** Campo trampa: las personas no lo ven ni lo llenan. */
    additionalInfo: z.string().max(0).optional(),
  })
  .refine((values) => values.channel === "whatsapp" || values.customerEmail !== undefined, {
    path: ["customerEmail"],
    message: "Ingresa tu correo para recibir la cotización por correo",
  });

export const quoteItemSchema = z.object({
  variantId: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

/** Lo que valida el servidor: formulario + líneas del carrito. */
export const quoteSubmissionSchema = quoteFormSchema.safeExtend({
  items: z.array(quoteItemSchema).min(1, "Tu carrito está vacío").max(MAX_QUOTE_ITEMS),
});

export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export type QuoteFormValues = z.output<typeof quoteFormSchema>;
export type QuoteSubmission = z.output<typeof quoteSubmissionSchema>;
