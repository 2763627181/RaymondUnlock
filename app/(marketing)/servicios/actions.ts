"use server";

import { z } from "zod";
import { createRepairRequest, getServices, getSiteSettings } from "@/lib/data";
import {
  renderRepairConfirmationEmail,
  renderRepairNotificationEmail,
} from "@/lib/email/repair-email";
import { sendEmail } from "@/lib/email/send";
import { buildRepairWhatsAppUrl } from "@/lib/repairs/whatsapp";
import { SITE_URL } from "@/lib/seo";
import { repairFormSchema, type RepairFormValues } from "@/lib/validation/repair";
import { phonesLine } from "@/lib/contact";

export type RepairEmailStatus = "not_requested" | "sent" | "partial" | "failed";

export type SubmitRepairResult =
  | { ok: true; code: string; whatsappUrl: string; emailStatus: RepairEmailStatus }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

export async function submitRepairRequest(input: unknown): Promise<SubmitRepairResult> {
  const parsed = repairFormSchema.safeParse(input);
  if (!parsed.success) {
    const { fieldErrors, formErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      message: formErrors[0] ?? "Revisa los datos del formulario.",
      fieldErrors,
    };
  }

  try {
    return await processRepairRequest(parsed.data);
  } catch (error) {
    console.error("[reparación] No se pudo procesar la solicitud:", error);
    return {
      ok: false,
      message:
        "No pudimos registrar tu solicitud en este momento. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp.",
    };
  }
}

async function processRepairRequest(data: RepairFormValues): Promise<SubmitRepairResult> {
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);
  const service = services.find((item) => item.id === data.serviceId);
  if (!service) {
    return {
      ok: false,
      message: "Ese servicio ya no está disponible. Elige otro de la lista.",
      fieldErrors: { serviceId: ["Elige un servicio de la lista"] },
    };
  }

  // Ya validado: después de guardar no queda nada que pueda lanzar (el correo
  // captura sus propios errores), para no mostrar fallo de algo que sí se registró.
  const code = await createRepairRequest({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    device: data.device,
    serviceId: service.id,
    issueDescription: data.issueDescription,
  });
  const details = {
    code,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    device: data.device,
    serviceName: service.name,
    issueDescription: data.issueDescription,
  };
  const whatsappUrl = buildRepairWhatsAppUrl(settings.whatsappNumber, {
    ...details,
    siteHost: new URL(SITE_URL).host,
  });

  let emailStatus: RepairEmailStatus = "not_requested";
  if (data.channel !== "whatsapp") {
    const emailData = { ...details, customerEmail: data.customerEmail };
    const [notified, confirmed] = await Promise.all([
      sendEmail({
        to: process.env.ORDER_NOTIFICATION_EMAIL ?? settings.email,
        replyTo: data.customerEmail,
        ...renderRepairNotificationEmail(emailData),
      }),
      data.customerEmail
        ? sendEmail({
            to: data.customerEmail,
            ...renderRepairConfirmationEmail(emailData, {
              phoneDisplay: phonesLine(settings),
              address: settings.address,
            }),
          })
        : Promise.resolve(true),
    ]);
    emailStatus = notified && confirmed ? "sent" : notified || confirmed ? "partial" : "failed";
  }

  return { ok: true, code, whatsappUrl, emailStatus };
}
