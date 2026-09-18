import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductCardData } from "@/types/catalog";

export function RelatedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-surface-2 mt-16 py-14 sm:py-16">
      <Container>
        <SectionHeading title="También te puede interesar" />
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
