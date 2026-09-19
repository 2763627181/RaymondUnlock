import { emailLayout, escapeHtml } from "@/lib/email/html";

export interface RepairEmailData {
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | undefined;
  device: string;
  serviceName: string;
  issueDescription: string;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:3px 12px 3px 0;color:#6b7280;font-size:14px;vertical-align:top;">${label}</td><td style="padding:3px 0;font-size:14px;">${escapeHtml(value)}</td></tr>`;
}

function issueBlock(data: RepairEmailData): string {
  return `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;"><strong>Problema:</strong><br>${escapeHtml(data.issueDescription).replace(/\n/g, "<br>")}</p>`;
}

/** Aviso interno para el negocio. */
export function renderRepairNotificationEmail(data: RepairEmailData): {
  subject: string;
  html: string;
} {
  const details = [
    row("Cliente", data.customerName),
    row("Teléfono", data.customerPhone),
    ...(data.customerEmail ? [row("Correo", data.customerEmail)] : []),
    row("Equipo", data.device),
    row("Servicio", data.serviceName),
  ].join("");

  return {
    subject: `Nueva solicitud de reparación ${data.code} — ${data.customerName}`,
    html: emailLayout({
      title: `Solicitud de reparación ${data.code}`,
      preheader: `${data.customerName}: ${data.serviceName} para ${data.device}`,
      body: `<table role="presentation" cellpadding="0" cellspacing="0">${details}</table>${issueBlock(data)}`,
    }),
  };
}

/** Copia de confirmación para el cliente. */
export function renderRepairConfirmationEmail(
  data: RepairEmailData,
  contact: { phoneDisplay: string; address: string },
): { subject: string; html: string } {
  return {
    subject: `Recibimos tu solicitud ${data.code}`,
    html: emailLayout({
      title: `Gracias, ${data.customerName}. Recibimos tu solicitud.`,
      preheader: `Tu código es ${data.code}`,
      body: `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Tu código es <strong>${escapeHtml(data.code)}</strong>. Te contactaremos para coordinar el diagnóstico de tu ${escapeHtml(data.device)}.</p>
<table role="presentation" cellpadding="0" cellspacing="0">${row("Servicio", data.serviceName)}</table>
${issueBlock(data)}
<p style="margin:24px 0 0;font-size:14px;line-height:1.6;">Raymond Unlock<br>${escapeHtml(contact.address)}<br>WhatsApp / teléfono: ${escapeHtml(contact.phoneDisplay)}</p>`,
    }),
  };
}
