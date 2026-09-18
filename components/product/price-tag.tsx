import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PriceTag({
  minPrice,
  maxPrice,
  compareAtPrice,
  discountPercent,
  className,
}: {
  minPrice: number;
  maxPrice: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  className?: string;
}) {
  const isRange = minPrice !== maxPrice;

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
