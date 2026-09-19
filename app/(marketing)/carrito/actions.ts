"use server";

import { z } from "zod";
import { MAX_LINE_QUANTITY } from "@/lib/cart/constants";
import { computeSubtotal, priceLine } from "@/lib/cart/pricing";
import { buildQuoteWhatsAppUrl } from "@/lib/cart/whatsapp";
import { createQuote, getPricingRows, getSiteSettings } from "@/lib/data";
import {
  renderQuoteConfirmationEmail,
  renderQuoteNotificationEmail,
} from "@/lib/email/quote-email";
import { sendEmail } from "@/lib/email/send";
import { getQuoteViewer } from "@/lib/pricing/viewer";
import { SITE_URL } from "@/lib/seo";
import { quoteSubmissionSchema, type QuoteSubmission } from "@/lib/validation/quote";
import type { PriceTier } from "@/types/catalog";

export type QuoteEmailStatus = "not_requested" | "sent" | "partial" | "failed";

export type SubmitQuoteResult =
  | {
      ok: true;
      code: string;
      whatsappUrl: string;
      subtotal: number;
      emailStatus: QuoteEmailStatus;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Variantes que ya no existen o están agotadas; el cliente las quita del carrito. */
      unavailableVariantIds?: string[];
    };

export async function submitQuote(input: unknown): Promise<SubmitQuoteResult> {
  const parsed = quoteSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    const { fieldErrors, formErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      message: formErrors[0] ?? "Revisa los datos del formulario.",
      fieldErrors,
    };
  }

  try {
    return await processQuote(parsed.data);
  } catch (error) {
    console.error("[cotización] No se pudo procesar la solicitud:", error);
    return {
      ok: false,
      message:
        "No pudimos registrar tu cotización en este momento. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp.",
    };
  }
}

async function processQuote(data: QuoteSubmission): Promise<SubmitQuoteResult> {
  // El precio que envía el navegador nunca se usa: se vuelve a leer todo aquí.
  const { tier, userId } = await getQuoteViewer();

  const quantities = new Map<string, number>();
  for (const item of data.items) {
    const current = quantities.get(item.variantId) ?? 0;
    quantities.set(item.variantId, Math.min(MAX_LINE_QUANTITY, current + item.quantity));
  }

  const rows = await getPricingRows([...quantities.keys()]);
  const rowById = new Map(rows.map((row) => [row.variantId, row]));
  const unavailableVariantIds = [...quantities.keys()].filter((id) => {
    const row = rowById.get(id);
    return !row || row.stock <= 0;
  });
  if (unavailableVariantIds.length > 0) {
    return {
      ok: false,
      message:
        "Algunos productos de tu carrito ya no están disponibles. Los quitamos para que puedas revisar tu cotización.",
      unavailableVariantIds,
    };
  }

  const lines = [...quantities.entries()].flatMap(([variantId, quantity]) => {
    const row = rowById.get(variantId);
    return row ? [priceLine(row, tier, quantity)] : [];
  });
  const subtotal = computeSubtotal(lines);
  // El tipo de precio es el que realmente se cobró: un mayorista cuyas líneas no
  // alcanzan la cantidad mínima paga precio por unidad.
  const appliedTier: PriceTier = lines.some((line) => line.tierApplied === "wholesale")
    ? "wholesale"
    : "retail";
  // Los ajustes se leen antes de guardar: después de persistir nada puede lanzar,
  // o el cliente vería un error de una cotización que sí quedó registrada.
  const settings = await getSiteSettings();
  const code = await createQuote({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    businessName: data.businessName,
    note: data.note,
    tier: appliedTier,
    channel: data.channel,
    subtotal,
    lines,
    userId,
  });

  const messageData = {
    code,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    businessName: data.businessName,
    note: data.note,
    tier: appliedTier,
    lines,
    subtotal,
  };
  const whatsappUrl = buildQuoteWhatsAppUrl(settings.whatsappNumber, {
    ...messageData,
    siteHost: new URL(SITE_URL).host,
  });

  let emailStatus: QuoteEmailStatus = "not_requested";
  if (data.channel !== "whatsapp") {
    const emailData = { ...messageData, customerEmail: data.customerEmail };
    const notification = renderQuoteNotificationEmail(emailData);
    const confirmation = renderQuoteConfirmationEmail(emailData, {
      phoneDisplay: settings.phoneDisplay,
      address: settings.address,
    });

    const [notified, confirmed] = await Promise.all([
      sendEmail({
        to: process.env.ORDER_NOTIFICATION_EMAIL ?? settings.email,
        replyTo: data.customerEmail,
        ...notification,
      }),
      data.customerEmail
        ? sendEmail({ to: data.customerEmail, ...confirmation })
        : Promise.resolve(true),
    ]);
    emailStatus = notified && confirmed ? "sent" : notified || confirmed ? "partial" : "failed";
  }

  return { ok: true, code, whatsappUrl, subtotal, emailStatus };
}
