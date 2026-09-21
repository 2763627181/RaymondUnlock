export type ContactChannel = "whatsapp" | "email" | "both";

/**
 * El correo (Resend) es opcional: solo existe si hay `RESEND_API_KEY`. Sin ella los
 * formularios ofrecen únicamente WhatsApp y el servidor no llama a Resend.
 */
export function isEmailEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return Boolean(env.RESEND_API_KEY?.trim());
}

/** Lo que el navegador pida no importa: sin correo, el único canal posible es WhatsApp. */
export function effectiveChannel(channel: ContactChannel, emailEnabled: boolean): ContactChannel {
  return emailEnabled ? channel : "whatsapp";
}
