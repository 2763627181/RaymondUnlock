import Link from "next/link";
import { Clock } from "lucide-react";
import { DynamicIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/types/site";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/servicios/${service.slug}`}
      className="border-border hover:bg-surface-2 focus-visible:ring-ring flex h-full flex-col rounded-lg border p-6 transition-colors outline-none focus-visible:ring-2"
    >
      <span className="bg-surface-2 text-brand-red-600 mb-4 flex size-11 items-center justify-center rounded-full">
        <DynamicIcon name={service.icon} className="size-5" />
      </span>
      <h3 className="text-lg font-semibold">{service.name}</h3>
      {service.description ? (
        <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
          {service.description}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5 text-sm">
        {service.priceFrom !== null ? (
          <p className="tabular-nums-price text-muted-foreground">
            Desde{" "}
            <span className="text-foreground font-semibold">{formatPrice(service.priceFrom)}</span>
          </p>
        ) : null}
        {service.turnaround ? (
          <p className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {service.turnaround}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
