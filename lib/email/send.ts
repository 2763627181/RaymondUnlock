import "server-only";
import { Resend } from "resend";

const DEFAULT_FROM = "Raymond Unlock <onboarding@resend.dev>";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  replyTo?: string | undefined;
}

/** Devuelve true si Resend aceptó el correo. Un fallo nunca tumba el flujo de la cotización. */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY no está configurada; no se envió el correo.");
    return false;
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      replyTo: message.replyTo,
    });
    if (error) {
      console.error("[email] Resend rechazó el correo:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Error enviando el correo:", error);
    return false;
  }
}
