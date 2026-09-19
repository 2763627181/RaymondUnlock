import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProcessTimeline } from "@/components/services/process-timeline";
import { RepairRequestForm } from "@/components/services/repair-request-form";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { getServices, getSiteSettings } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Servicio técnico: reparación y desbloqueo de celulares",
  description:
    "Cambio de pantalla, batería, pin de carga, desbloqueo y más para tu celular en Santo Domingo, Distrito Nacional. Solicita tu diagnóstico.",
  alternates: { canonical: "/servicios" },
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Hola, quiero consultar por un servicio técnico para mi equipo.",
  );

  return (
    <>
      <Container className="pt-8 pb-12 sm:pt-10 sm:pb-16">
        <Breadcrumbs
          items={[
            { name: "Inicio", path: "/" },
            { name: "Servicios", path: "/servicios" },
          ]}
        />
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Servicio técnico en Santo Domingo
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Reparamos y desbloqueamos tu celular. Cuéntanos qué le pasa y te decimos el precio antes
            de empezar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-11 px-6 text-base">
              <Link href="#solicitar">Solicitar diagnóstico</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6 text-base">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" /> Escribir por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </Container>

      <Container className="pb-16 sm:pb-20">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>

      <section className="bg-surface-2 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="Así trabajamos"
              description="Cuatro pasos claros, sin sorpresas."
            />
          </Reveal>
          <ProcessTimeline steps={settings.repairProcess} />
        </Container>
      </section>

      <section id="solicitar" className="scroll-mt-24 py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Solicita tu diagnóstico
            </h2>
            <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
              Llena el formulario y te contactamos para coordinar. También puedes escribirnos o
              pasar por la tienda.
            </p>
            <address className="mt-6 text-[15px] leading-relaxed not-italic">
              <strong>Raymond Unlock</strong>
              <br />
              {settings.address}
              <br />
              WhatsApp y teléfono: {settings.phoneDisplay}
            </address>
          </Reveal>
          <RepairRequestForm services={services.map(({ id, name }) => ({ id, name }))} />
        </Container>
      </section>
    </>
  );
}
