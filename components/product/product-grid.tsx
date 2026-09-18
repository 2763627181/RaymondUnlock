import { ProductCard } from "@/components/product/product-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/types/catalog";

export function ProductGrid({
  products,
  wide = false,
  priorityCount = 0,
  className,
}: {
  products: ProductCardData[];
  /** 5 columnas en escritorio (más vendidos) en vez de 4. */
  wide?: boolean;
  priorityCount?: number;
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
        <StaggerItem key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
