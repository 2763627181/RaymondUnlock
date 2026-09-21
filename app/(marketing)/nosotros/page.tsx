import type { Metadata } from "next";
import Link from "next/link";
import { Repeat, Smartphone, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Raymond Unlock: desbloqueo, reparación y venta de celulares y artículos electrónicos en Santo Domingo, Distrito Nacional.",
  alternates: { canonical: "/nosotros" },
};

const pillars = [
  {
    icon: Smartphone,
    title: "Vendemos",
    text: "Celulares, tablets, audio, smartwatches y accesorios, nuevos, open box y usados.",
    href: "/tienda",
    cta: "Ver la tienda",
  },
  {
    icon: Repeat,
    title: "Reparamos y desbloqueamos",
    text: "Pantallas, baterías, pines de carga, daño por líquido, software y desbloqueo.",
    href: "/servicios",
    cta: "Ver los servicios",
  },
  {
    icon: Store,
    title: "Suministramos al por mayor",
    text: "Si tienes un negocio, te damos precios especiales por volumen.",
    href: "/mayorista",
    cta: "Cotizar al por mayor",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Nosotros", path: "/nosotros" },
        ]}
      />
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Celulares y más, en Santo Domingo
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
          Raymond Unlock es una tienda dedicada al desbloqueo, la reparación y la venta de celulares
          y artículos electrónicos.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {pillars.map(({ icon: Icon, title, text, href, cta }) => (
          <section key={title} className="border-border flex flex-col rounded-lg border p-6">
            <span className="bg-surface-2 mb-4 flex size-11 items-center justify-center rounded-full">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{text}</p>
            <Link
              href={href}
              className="text-brand-blue mt-auto pt-5 text-sm font-medium hover:underline"
            >
              {cta}
            </Link>
          </section>
        ))}
      </div>

      <section className="bg-surface-2 mt-12 rounded-lg p-8 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">Dónde estamos</h2>
        <address className="text-muted-foreground mt-2 text-[15px] leading-relaxed not-italic">
          {settings.address}
        </address>
        <Button asChild className="mt-5 h-11 px-6 text-base">
          <Link href="/contacto">Ver cómo contactarnos</Link>
        </Button>
      </section>
    </Container>
  );
}
