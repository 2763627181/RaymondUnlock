"use client";

import { cn } from "@/lib/utils";
import { selectCanSeeWholesale, useViewerStore, type PriceView } from "@/lib/viewer/store";

const OPTIONS: { value: PriceView; label: string }[] = [
  { value: "retail", label: "Unidad" },
  { value: "wholesale", label: "Por mayor" },
];

/** "Ver precios: Unidad / Por mayor". Solo aparece para mayoristas aprobados (y admins). */
export function PriceViewSwitch({
  className,
  labelClassName = "hidden 2xl:inline",
}: {
  className?: string;
  /** Visibilidad de "Ver precios:": en el encabezado solo cabe en pantallas muy anchas. */
  labelClassName?: string;
}) {
  const canSee = useViewerStore(selectCanSeeWholesale);
  const view = useViewerStore((state) => state.priceView);
  const setView = useViewerStore((state) => state.setPriceView);
  if (!canSee) return null;

  return (
    <div
      role="group"
      aria-label="Ver precios"
      className={cn("items-center gap-2 text-sm", className)}
    >
      <span className={cn("text-muted-foreground whitespace-nowrap", labelClassName)}>
        Ver precios:
      </span>
      <div className="bg-surface-2 flex rounded-full p-0.5">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={view === option.value}
            onClick={() => setView(option.value)}
            className={cn(
              "focus-visible:ring-ring rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2",
              view === option.value ? "bg-ink text-surface" : "text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
