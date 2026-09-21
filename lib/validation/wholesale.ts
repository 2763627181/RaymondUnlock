import { z } from "zod";
import { MAX_WHOLESALE_LINES, MAX_WHOLESALE_QUANTITY } from "@/lib/wholesale/types";

/** Lo que valida el servidor de un pedido al por mayor: solo ids y cantidades, nunca precios. */
export const wholesaleOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(MAX_WHOLESALE_QUANTITY),
      }),
    )
    .min(1, "Tu pedido está vacío")
    .max(MAX_WHOLESALE_LINES, `Máximo ${MAX_WHOLESALE_LINES} productos por pedido`),
  /** null cuando no hay contactos configurados: el pedido va al WhatsApp del negocio. */
  contactId: z.uuid().nullable(),
});

export type WholesaleOrderInput = z.input<typeof wholesaleOrderSchema>;
export type WholesaleOrderValues = z.output<typeof wholesaleOrderSchema>;
