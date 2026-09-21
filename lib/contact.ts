import type { SiteSettings } from "@/types/site";

export interface PhoneEntry {
  label: "Cel" | "Local";
  display: string;
  href: string;
}

/** "829-688-3114" (o "18296883114") → "tel:+18296883114". */
export function telHref(display: string): string {
  const digits = display.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return `tel:+1${national}`;
}

/** Los teléfonos del negocio en orden de importancia: el celular (que también es el WhatsApp) y, si hay, el del local. */
export function contactPhones(
  settings: Pick<SiteSettings, "phoneDisplay" | "whatsappNumber" | "localPhone">,
): PhoneEntry[] {
  const phones: PhoneEntry[] = [
    { label: "Cel", display: settings.phoneDisplay, href: `tel:+${settings.whatsappNumber}` },
  ];
  if (settings.localPhone) {
    phones.push({
      label: "Local",
      display: settings.localPhone,
      href: telHref(settings.localPhone),
    });
  }
  return phones;
}

/** "Cel 809-906-3114 · Local 829-688-3114", para correos, informes y textos corridos. */
export function phonesLine(
  settings: Pick<SiteSettings, "phoneDisplay" | "whatsappNumber" | "localPhone">,
): string {
  return contactPhones(settings)
    .map(({ label, display }) => `${label} ${display}`)
    .join(" · ");
}
