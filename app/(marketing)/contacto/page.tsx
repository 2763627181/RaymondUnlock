import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon, ThreadsIcon } from "@/components/icons/social-icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data";
import { localBusinessJsonLd } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos por WhatsApp, llámanos o visítanos en Santo Domingo, Distrito Nacional. Calle México #6, casi esq. Isabel Aguiar.",
  alternates: { canonical: "/contacto" },
};

const cardClass = "border-border rounded-lg border p-6";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Hola, quiero hacer una consulta.",
  );
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

  return (
    <Container className="py-8 sm:py-10">
      <JsonLd data={localBusinessJsonLd(settings)} />
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Contacto", path: "/contacto" },
        ]}
      />
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Contacto</h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
          Estamos en Santo Domingo, Distrito Nacional. Escríbenos por WhatsApp para consultar
          disponibilidad, precios o el horario de atención.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <section className={cardClass}>
          <MessageCircle className="text-success mb-4 size-6" aria-hidden="true" />
          <h2 className="text-lg font-semibold">WhatsApp</h2>
          <p className="text-muted-foreground mt-1 text-[15px]">
            La forma más rápida de conseguirnos.
          </p>
          <Button asChild className="mt-4 h-11 px-6 text-base">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Escribir al {settings.phoneDisplay}
            </a>
          </Button>
        </section>

        <section className={cardClass}>
          <MapPin className="text-brand-red-600 mb-4 size-6" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Visítanos</h2>
          <address className="text-muted-foreground mt-1 text-[15px] leading-relaxed not-italic">
            {settings.address}
          </address>
          <Button asChild variant="outline" className="mt-4 h-11 px-6 text-base">
            <a href={mapsHref} target="_blank" rel="noopener noreferrer">
              Cómo llegar
            </a>
          </Button>
        </section>

        <section className={cardClass}>
          <Phone className="text-ink-700 mb-4 size-6" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Teléfono</h2>
          <a
            href={`tel:+${settings.whatsappNumber}`}
            className="tabular-nums-price text-brand-blue mt-1 inline-block text-[15px] hover:underline"
          >
            {settings.phoneDisplay}
          </a>
        </section>

        <section className={cardClass}>
          <Mail className="text-ink-700 mb-4 size-6" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Correo</h2>
          <a
            href={`mailto:${settings.email}`}
            className="text-brand-blue mt-1 inline-block text-[15px] break-all hover:underline"
          >
            {settings.email}
          </a>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Síguenos</h2>
        <div className="flex gap-3">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Raymond Unlock"
            className="bg-surface-2 hover:bg-border flex size-11 items-center justify-center rounded-full transition-colors"
          >
            <InstagramIcon className="size-5" />
          </a>
          <a
            href={settings.threadsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Threads de Raymond Unlock"
            className="bg-surface-2 hover:bg-border flex size-11 items-center justify-center rounded-full transition-colors"
          >
            <ThreadsIcon className="size-5" />
          </a>
        </div>
      </section>
    </Container>
  );
}
