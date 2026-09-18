import { cn } from "@/lib/utils";

export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Cargando productos"
      className={cn("grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <div className="skeleton aspect-square" />
          <div className="skeleton mt-3 h-3 w-1/3" />
          <div className="skeleton mt-2 h-4 w-4/5" />
          <div className="skeleton mt-2 h-4 w-2/5" />
        </div>
      ))}
    </div>
  );
}
