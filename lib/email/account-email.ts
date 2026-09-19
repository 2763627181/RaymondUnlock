import { emailButton, emailLayout, emailParagraph, escapeHtml } from "@/lib/email/html";

interface Rendered {
  subject: string;
  html: string;
}

const LINK_NOTE =
  "Si no fuiste tú, ignora este mensaje: no se hará ningún cambio en tu cuenta. El enlace vence en 1 hora.";

export function renderConfirmAccountEmail(input: {
  name: string;
  link: string;
  wholesale: boolean;
}): Rendered {
  const followUp = input.wholesale
    ? "Después de confirmar, revisaremos tu solicitud de cuenta al por mayor y te avisaremos por este medio."
    : "Con tu cuenta puedes guardar tus datos y enviar cotizaciones más rápido.";
  return {
    subject: "Confirma tu cuenta en Raymond Unlock",
    html: emailLayout({
      title: `Hola, ${input.name}. Confirma tu correo`,
      preheader: "Un clic para activar tu cuenta",
      body:
        emailParagraph("Gracias por registrarte. Confirma tu correo para activar tu cuenta.") +
        emailButton(input.link, "Confirmar mi correo") +
        emailParagraph(followUp) +
        `<p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(LINK_NOTE)}</p>`,
    }),
  };
}

export function renderPasswordResetEmail(input: { link: string }): Rendered {
  return {
    subject: "Restablece tu contraseña de Raymond Unlock",
    html: emailLayout({
      title: "Restablece tu contraseña",
      preheader: "Elige una contraseña nueva",
      body:
        emailParagraph("Recibimos una solicitud para cambiar la contraseña de tu cuenta.") +
        emailButton(input.link, "Elegir una contraseña nueva") +
        `<p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(LINK_NOTE)}</p>`,
    }),
  };
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:3px 12px 3px 0;color:#6b7280;font-size:14px;vertical-align:top;">${label}</td><td style="padding:3px 0;font-size:14px;">${escapeHtml(value)}</td></tr>`;
}

/** Aviso interno: una solicitud de cuenta mayorista ya confirmó su correo y espera revisión. */
export function renderWholesaleRequestEmail(input: {
  fullName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  rnc: string | null;
  estimatedVolume: string | null;
  reviewUrl: string;
}): Rendered {
  const details = [
    row("Nombre", input.fullName),
    row("Correo", input.email),
    ...(input.phone ? [row("Teléfono", input.phone)] : []),
    ...(input.businessName ? [row("Negocio", input.businessName)] : []),
    ...(input.rnc ? [row("RNC", input.rnc)] : []),
    ...(input.estimatedVolume ? [row("Volumen estimado", input.estimatedVolume)] : []),
  ].join("");
  return {
    subject: `Nueva solicitud de cuenta mayorista — ${input.businessName ?? input.fullName}`,
    html: emailLayout({
      title: "Nueva solicitud de cuenta mayorista",
      preheader: `${input.fullName} espera tu revisión`,
      body: `<table role="presentation" cellpadding="0" cellspacing="0">${details}</table>${emailButton(input.reviewUrl, "Revisar solicitud")}`,
    }),
  };
}

/** Respuesta al solicitante cuando el admin aprueba o rechaza su cuenta. */
export function renderWholesaleDecisionEmail(input: {
  name: string;
  approved: boolean;
  shopUrl: string;
  contact: { phoneDisplay: string };
}): Rendered {
  if (input.approved) {
    return {
      subject: "Tu cuenta al por mayor fue aprobada",
      html: emailLayout({
        title: `¡Listo, ${input.name}! Tu cuenta al por mayor está activa`,
        preheader: "Ya puedes ver los precios al por mayor",
        body:
          emailParagraph(
            "Aprobamos tu cuenta. Al iniciar sesión verás el precio al por mayor y la cantidad mínima de cada producto.",
          ) + emailButton(input.shopUrl, "Ir a la tienda"),
      }),
    };
  }
  return {
    subject: "Sobre tu solicitud de cuenta al por mayor",
    html: emailLayout({
      title: `Hola, ${input.name}`,
      preheader: "Novedades de tu solicitud",
      body:
        emailParagraph(
          "Por ahora no pudimos aprobar tu solicitud de cuenta al por mayor. Tu cuenta sigue activa y puedes comprar a precio de unidad.",
        ) +
        emailParagraph(
          `Si quieres más información o crees que se trata de un error, escríbenos o llámanos al ${input.contact.phoneDisplay}.`,
        ),
    }),
  };
}
