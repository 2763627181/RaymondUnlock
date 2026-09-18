import type { Metadata } from "next";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { GuaranteeStrip } from "@/components/home/guarantee-strip";
import { CategoryCard } from "@/components/home/category-card";
import { SectionHeading } from "@/components/home/section-heading";
import { WhyUs } from "@/components/home/why-us";
import { ServicesBand } from "@/components/home/services-band";
import { WholesaleCta } from "@/components/home/wholesale-cta";
import { Testimonials } from "@/components/home/testimonials";
import { QuickContact } from "@/components/home/quick-contact";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ProductGrid } from "@/components/product/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getBanners,
  getFeaturedProducts,
  getPromoProducts,
  getServices,
  getSiteSettings,
  getTopLevelCategories,
} from "@/lib/data";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

export const revalidate = 300;

const FEATURED_SERVICE_SLUGS = [
  "cambio-de-pantalla",
  "cambio-de-bateria",
  "desbloqueo-de-celulares",
  "cambio-de-pin-de-carga",
];

export const metadata: Metadata = {
  title: { absolute: "Raymond Unlock — Celulares y Más en Santo Domingo" },
  description:
    "Compra celulares, tablets, audio, smartwatches y accesorios en Santo Domingo, Distrito Nacional. Desbloqueo y reparación de celulares. Precios especiales al por mayor.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [banners, categories, promos, bestSellers, services, settings] = await Promise.all([
    getBanners(),
    getTopLevelCategories(),
    getPromoProducts(4),
    getFeaturedProducts(5),
    getServices(),
    getSiteSettings(),
  ]);

  const featuredServices = FEATURED_SERVICE_SLUGS.flatMap((slug) => {
    const service = services.find((item) => item.slug === slug);
    return service ? [service] : [];
  });

  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />
      <JsonLd data={websiteJsonLd(settings)} />

      <HeroCarousel banners={banners} />
      <GuaranteeStrip items={settings.guarantees} />

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="Nuestras categorías"
              description="Celulares, tablets, audio y más, en Santo Domingo."
              action={{ label: "Ver toda la tienda", href: "/tienda" }}
            />
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <StaggerItem key={category.id}>
                <CategoryCard category={category} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {promos.length > 0 ? (
        <section className="pb-16 sm:pb-20">
          <Container>
            <Reveal>
              <SectionHeading
                title="Promociones"
                description="Precios rebajados por tiempo limitado."
                action={{ label: "Ver más", href: "/tienda" }}
              />
            </Reveal>
            <ProductGrid products={promos} />
          </Container>
        </section>
      ) : null}

      <Reveal>
        <WhyUs items={settings.whyUs} />
      </Reveal>

      <Reveal>
        <ServicesBand services={featuredServices} />
      </Reveal>

      <section className="bg-surface-2 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="Más vendidos"
              description="Lo que más buscan nuestros clientes."
              action={{ label: "Ver toda la tienda", href: "/tienda" }}
            />
          </Reveal>
          <ProductGrid products={bestSellers} wide />
        </Container>
      </section>

      <Reveal className="pt-16 sm:pt-20">
        <WholesaleCta />
      </Reveal>

      <Reveal>
        <Testimonials items={settings.testimonials} />
      </Reveal>

      <Reveal>
        <QuickContact settings={settings} />
      </Reveal>
    </>
  );
}
