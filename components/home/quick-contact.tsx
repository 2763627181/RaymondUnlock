import { MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/types/site";

export function QuickContact({ settings }: { settings: SiteSettings }) {
  const whatsappHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero información sobre un producto.",
  )}`;

  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
            Escríbenos y te ayudamos a conseguirlo. Estamos en Santo Domingo, Distrito Nacional.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 px-6 text-base">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" /> Escribir por WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6 text-base">
            <a href={`tel:+${settings.whatsappNumber}`}>
              <Phone aria-hidden="true" /> {settings.phoneDisplay}
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
