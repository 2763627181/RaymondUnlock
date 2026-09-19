import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MessageCircle, Package, Percent } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { WholesaleSignup } from "@/components/wholesale/wholesale-signup";
import { Button } from "@/components/ui/button";
import { getSiteSettings, getTopLevelCategories } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Al por mayor: precios especiales para tu negocio",
  description:
    "Suministro de celulares, tablets, audio, smartwatches y accesorios al por mayor en Santo Domingo. Solicita tu cuenta de mayorista y consulta el precio por volumen.",
  alternates: { canonical: "/mayorista" },
};

const benefits = [
  {
    icon: Percent,
    title: "Precio por volumen",
    text: "Cada producto tiene su precio al por mayor y la cantidad mínima para aplicarlo.",
  },
  {
    icon: Package,
    title: "Varias categorías",
    text: "Celulares, tablets, audio, smartwatches y accesorios en un solo proveedor.",
  },
  {
    icon: BadgeCheck,
    title: "Cuenta aprobada",
    text: "Revisamos tu solicitud y, al aprobarla, ves los precios al por mayor en todo el catálogo.",
  },
];

export default async function WholesalePage() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getTopLevelCategories()]);
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    "Hola, tengo un negocio y quiero solicitar mi cuenta de mayorista.",
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
              Precios especiales por volumen para tiendas, revendedores y empresas. Solicita tu
              cuenta y consulta el precio por cantidad de cada producto.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-11 px-6 text-base">
                <a href="#solicitar">Solicitar mi cuenta</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-white/25 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/tienda">Ver el catálogo</Link>
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

      <section id="solicitar" className="scroll-mt-24 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="Solicita tu cuenta al por mayor"
              description="Revisamos cada solicitud y te respondemos por correo."
            />
          </Reveal>
          <WholesaleSignup />
          <p className="text-muted-foreground mt-6 text-center text-sm">
            ¿Prefieres hablar con alguien?{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue inline-flex items-center gap-1 underline underline-offset-4"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" /> Escríbenos por WhatsApp
            </a>
          </p>
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
