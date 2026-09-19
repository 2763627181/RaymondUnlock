import { ProductCard } from "@/components/product/product-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/types/catalog";

export function ProductGrid({
  products,
  wide = false,
  immediateCount = 0,
  headingLevel = 3,
  className,
}: {
  products: ProductCardData[];
  /** 5 columnas en escritorio (más vendidos) en vez de 4. */
  wide?: boolean;
  /** Tarjetas sobre el pliegue: visibles desde el HTML y con imagen prioritaria. */
  immediateCount?: number;
  /** h2 cuando la página no tiene un h2 previo (catálogo); h3 dentro de una sección con h2. */
  headingLevel?: 2 | 3;
  className?: string;
}) {
  return (
    <Stagger
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3",
        wide ? "xl:grid-cols-5" : "xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <StaggerItem key={product.id} immediate={index < immediateCount}>
          <ProductCard
            product={product}
            priority={index < immediateCount}
            headingLevel={headingLevel}
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
