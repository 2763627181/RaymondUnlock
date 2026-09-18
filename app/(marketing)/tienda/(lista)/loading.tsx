import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton";
import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-8 sm:py-10">
      <div className="skeleton mb-4 h-4 w-40" />
      <div className="skeleton mb-8 h-10 w-64" />
      <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
        <div className="hidden space-y-4 lg:block">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-24 w-full" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </Container>
  );
}
