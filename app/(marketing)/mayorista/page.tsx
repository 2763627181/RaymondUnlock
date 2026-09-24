import type { Metadata } from "next";
import Link from "next/link";
import { Headset, MessageCircle, Package, Percent } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import { getSiteSettings, getTopLevelCategories } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Al por mayor: precios especiales para tu negocio",
  description:
    "Suministro de celulares, tablets, audio, smartwatches y accesorios al por mayor en Santo Domingo. Escríbenos por WhatsApp y te damos el precio por volumen.",
  alternates: { canonical: "/mayorista" },
};

const benefits = [
  {
    icon: Percent,
    title: "Precio por volumen",
    text: "Dinos qué equipos y cuántos necesitas y te damos el precio por cantidad.",
  },
  {
    icon: Package,
    title: "Varias categorías",
    text: "Celulares, tablets, audio, smartwatches y accesorios en un solo proveedor.",
  },
  {
    icon: Headset,
    title: "Atención directa",
    text: "Te respondemos por WhatsApp, sin cuentas ni trámites.",
  },
];

export default async function WholesalePage() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getTopLevelCategories()]);
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Hola, tengo un negocio y quiero cotizar al por mayor.",
  );

  return (
    <>
      <section className="bg-ink text-surface">
        <Container className="py-12 sm:py-16">
          <Breadcrumbs
            tone="dark"
            items={[
              { name: "Inicio", path: "/" },
              { name: "Al por mayor", path: "/mayorista" },
            ]}
          />
          <div className="max-w-2xl">
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
              ¿Tienes un negocio? Compra al por mayor.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Precios especiales por volumen para tiendas, revendedores y empresas. Escríbenos con
              lo que necesitas y te cotizamos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 px-6 text-base">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" /> Cotizar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="Cómo funciona"
              description="Simple y sin trámites innecesarios."
            />
          </Reveal>
          <Stagger className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="border-border h-full rounded-lg border p-6">
                  <span className="bg-surface-2 mb-4 flex size-11 items-center justify-center rounded-full">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="bg-surface-2 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="Qué suministramos"
              description="Explora las categorías con las que trabajamos."
            />
          </Reveal>
          <Stagger className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <StaggerItem key={category.id}>
                <Link
                  href={`/tienda/${category.slug}`}
                  className="bg-surface border-border hover:bg-surface-2 focus-visible:ring-ring inline-flex rounded-full border px-5 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                >
                  {category.name}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>
    </>
  );
}
