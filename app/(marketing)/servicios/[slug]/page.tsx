import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Smartphone, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { RepairRequestForm } from "@/components/services/repair-request-form";
import { JsonLd } from "@/components/seo/json-ld";
import { getServiceBySlug, getServices, getSiteSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { DynamicIcon } from "@/lib/icons";
import { serviceJsonLd } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata(props: PageProps<"/servicios/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  const description = `${service.description ?? service.name} Servicio técnico en Santo Domingo, Distrito Nacional.`;
  return {
    title: `${service.name} en Santo Domingo`,
    description,
    alternates: { canonical: `/servicios/${service.slug}` },
    openGraph: { title: service.name, description, url: `/servicios/${service.slug}` },
  };
}

export default async function ServicePage(props: PageProps<"/servicios/[slug]">) {
  const { slug } = await props.params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);

  const facts = [
    ...(service.priceFrom !== null
      ? [{ icon: Tag, label: "Precio", value: `Desde ${formatPrice(service.priceFrom)}` }]
      : []),
    ...(service.turnaround
      ? [{ icon: Clock, label: "Tiempo estimado", value: service.turnaround }]
      : []),
    ...(service.deviceTypes.length > 0
      ? [{ icon: Smartphone, label: "Equipos", value: service.deviceTypes.join(", ") }]
      : []),
  ];

  return (
    <Container className="py-8 sm:py-10">
      <JsonLd data={serviceJsonLd(service, settings)} />
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Servicios", path: "/servicios" },
          { name: service.name, path: `/servicios/${service.slug}` },
        ]}
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <span className="bg-surface-2 text-brand-red-600 mb-5 flex size-14 items-center justify-center rounded-full">
            <DynamicIcon name={service.icon} className="size-7" />
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {service.name}
          </h1>
          {service.description ? (
            <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
              {service.description}
            </p>
          ) : null}

          <dl className="border-border mt-8 divide-y border-y">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 py-4">
                <Icon className="text-muted-foreground mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-muted-foreground text-sm">{label}</dt>
                  <dd className="tabular-nums-price font-medium">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-4 text-xs">
            Precio y tiempo referenciales; te confirmamos ambos después del diagnóstico.
          </p>
        </div>

        <div>
          <h2 className="mb-5 text-2xl font-semibold tracking-tight">Solicita este servicio</h2>
          <RepairRequestForm
            services={services.map(({ id, name }) => ({ id, name }))}
            defaultServiceId={service.id}
          />
        </div>
      </div>
    </Container>
  );
}
