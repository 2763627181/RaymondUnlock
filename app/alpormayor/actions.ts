"use server";

import { z } from "zod";
import { clientIp } from "@/lib/auth/client-ip";
import {
  createWholesaleOrder,
  getSiteSettings,
  getWholesaleListing,
  getWholesalePriceRows,
} from "@/lib/data";
import { allowAttempt } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/seo";
import { wholesaleOrderSchema } from "@/lib/validation/wholesale";
import { buildWholesaleUrl } from "@/lib/wholesale/message";
import { MAX_WHOLESALE_QUANTITY } from "@/lib/wholesale/types";

export type SubmitWholesaleResult =
  | { ok: true; code: string; whatsappUrl: string; total: number }
  | {
      ok: false;
      message: string;
      /** Productos que ya no están en la lista; el cliente los quita del pedido. */
      unavailableIds?: string[];
    };

const round2 = (amount: number) => Math.round(amount * 100) / 100;

/**
 * Guarda el pedido y devuelve el enlace de WhatsApp con el mensaje armado. El
 * navegador solo manda ids y cantidades: los precios se vuelven a leer aquí.
 */
export async function submitWholesaleOrder(input: unknown): Promise<SubmitWholesaleResult> {
  const parsed = wholesaleOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        z.flattenError(parsed.error).formErrors[0] ?? "Revisa tu pedido e inténtalo de nuevo.",
    };
  }
  if (!allowAttempt(`wholesale:${await clientIp()}`, { limit: 15, windowMs: 60 * 60 * 1000 })) {
    return {
      ok: false,
      message: "Enviaste muchos pedidos seguidos. Espera un rato e inténtalo de nuevo.",
    };
  }

  try {
    return await processOrder(parsed.data);
  } catch (error) {
    console.error("[pedido mayorista] No se pudo procesar el pedido:", error);
    return {
      ok: false,
      message:
        "No pudimos registrar tu pedido en este momento. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp.",
    };
  }
}

async function processOrder(
  data: z.output<typeof wholesaleOrderSchema>,
): Promise<SubmitWholesaleResult> {
  const quantities = new Map<string, number>();
  for (const item of data.items) {
    const current = quantities.get(item.productId) ?? 0;
    quantities.set(item.productId, Math.min(MAX_WHOLESALE_QUANTITY, current + item.quantity));
  }

  const [rows, listing, settings] = await Promise.all([
    getWholesalePriceRows([...quantities.keys()]),
    getWholesaleListing(),
    getSiteSettings(),
  ]);

  const byId = new Map(rows.map((row) => [row.id, row]));
  const unavailableIds = [...quantities.keys()].filter((id) => !byId.has(id));
  if (unavailableIds.length > 0) {
    return {
      ok: false,
      message:
        "Algunos productos ya no están en el listado. Los quitamos para que revises tu pedido.",
      unavailableIds,
    };
  }

  // Con contactos configurados hay que elegir uno; sin ellos, va al WhatsApp del negocio.
  const contact = data.contactId ? listing.contacts.find((c) => c.id === data.contactId) : null;
  if (listing.contacts.length > 0 && !contact) {
    return { ok: false, message: "Elige a quién enviar el pedido." };
  }
  const whatsapp = contact?.whatsapp ?? settings.whatsappNumber;

  const lines = [...quantities.entries()].flatMap(([id, quantity]) => {
    const row = byId.get(id);
    return row
      ? [
          {
            productId: row.id,
            name: row.name,
            category: row.category,
            condition: row.condition,
            unitPrice: row.price,
            quantity,
            lineTotal: round2(row.price * quantity),
          },
        ]
      : [];
  });
  const total = round2(lines.reduce((sum, line) => sum + line.lineTotal, 0));

  // Todo lo que pueda fallar se lee antes de guardar: después de persistir nada
  // debe lanzar, o el cliente vería un error de un pedido que sí quedó registrado.
  const code = await createWholesaleOrder({
    contactLabel: contact
      ? `${contact.label}${contact.personName ? ` — ${contact.personName}` : ""}`
      : null,
    contactWhatsapp: whatsapp,
    total,
    lines,
  });

  const whatsappUrl = buildWholesaleUrl(whatsapp, {
    code,
    total,
    siteHost: new URL(SITE_URL).host,
    lines: lines.map((line) => ({
      name: line.name,
      condition: line.condition,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
    })),
  });
  return { ok: true, code, whatsappUrl, total };
}
