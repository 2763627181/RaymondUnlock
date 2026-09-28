import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-grid";
import { getPromoProducts } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ofertas del mes",
  description:
    "Los productos con precio rebajado este mes en Raymond Unlock: celulares, tablets, audio y accesorios.",
  alternates: { canonical: "/ofertas" },
};

// Tope alto a propósito (igual que el resto del catálogo): esta tienda no se acerca a esta cifra.
const MAX_OFFERS = 200;

export default async function OffersPage() {
  const offers = await getPromoProducts(MAX_OFFERS);

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Ofertas del mes", path: "/ofertas" },
        ]}
      />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ofertas del mes</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-[15px] leading-relaxed">
        Precios rebajados por tiempo limitado. Cuando se acaba una oferta, el producto sale de esta
        lista solo.
      </p>

      {offers.length > 0 ? (
        <ProductGrid products={offers} immediateCount={4} headingLevel={2} className="mt-8" />
      ) : (
        <div className="border-border mt-8 flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
          <Tag className="text-muted-foreground mb-4 size-10" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Por ahora no hay ofertas activas</h2>
          <p className="text-muted-foreground mt-2 max-w-md text-[15px] leading-relaxed">
            Vuelve pronto o escríbenos por WhatsApp para preguntar por precios especiales.
          </p>
        </div>
      )}
    </Container>
  );
}
