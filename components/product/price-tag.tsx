import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PriceTag({
  minPrice,
  maxPrice,
  compareAtPrice,
  discountPercent,
  wholesale,
  className,
}: {
  minPrice: number;
  maxPrice: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  /** Solo para mayoristas aprobados con "Por mayor" activo: el precio al por mayor es el principal. */
  wholesale?: { price: number; minQty: number } | null;
  className?: string;
}) {
  const isRange = minPrice !== maxPrice;

  if (wholesale) {
    return (
      <div className={cn("tabular-nums-price", className)}>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-muted-foreground text-xs">Por mayor desde</span>
          <span className="text-success-700 text-base font-semibold">
            {formatPrice(wholesale.price)}
          </span>
        </p>
        <p className="text-muted-foreground text-xs">
          Mín. {wholesale.minQty} {wholesale.minQty === 1 ? "unidad" : "unidades"} · Unidad{" "}
          {isRange ? "desde " : ""}
          {formatPrice(minPrice)}
        </p>
      </div>
    );
  }

  return (
    <p className={cn("tabular-nums-price flex flex-wrap items-baseline gap-x-2", className)}>
      {isRange ? <span className="text-muted-foreground text-xs">Desde</span> : null}
      <span
        className={cn(
          "text-base font-semibold",
          compareAtPrice ? "text-brand-red-600" : "text-foreground",
        )}
      >
        {formatPrice(minPrice)}
      </span>
      {compareAtPrice ? (
        <span className="text-muted-foreground text-sm line-through">
          {formatPrice(compareAtPrice)}
        </span>
      ) : null}
      {discountPercent ? (
        <span className="text-brand-red-600 text-xs font-semibold">−{discountPercent}%</span>
      ) : null}
    </p>
  );
}
