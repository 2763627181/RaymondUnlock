import { z } from "zod";
import { quoteChannelSchema } from "@/lib/validation/quote";

export const LAST_QUOTE_KEY = "ru-last-quote";

const lastQuoteSchema = z.object({
  code: z.string().regex(/^RU-\d{4}-\d{4,}$/),
  whatsappUrl: z.string().startsWith("https://wa.me/"),
  subtotal: z.number(),
  channel: quoteChannelSchema,
  emailStatus: z.enum(["not_requested", "sent", "partial", "failed"]),
});

export type LastQuote = z.infer<typeof lastQuoteSchema>;

/** El código por sí solo no revela nada: los datos del pedido viven solo en esta pestaña. */
export function saveLastQuote(quote: LastQuote): void {
  try {
    sessionStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(quote));
  } catch {
    // Sin sessionStorage la pantalla de confirmación usa un enlace genérico de WhatsApp.
  }
}

export function parseLastQuote(raw: string | null): LastQuote | null {
  if (!raw) return null;
  try {
    const parsed = lastQuoteSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
