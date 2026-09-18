import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { SectionHeading } from "@/components/home/section-heading";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/lib/icons";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/types/site";

export function ServicesBand({ services }: { services: Service[] }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="Servicio técnico"
          description="Reparamos y desbloqueamos tu equipo. Te decimos el precio antes de empezar."
          action={{ label: "Ver todos los servicios", href: "/servicios" }}
        />
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {services.map((service) => (
            <StaggerItem key={service.id}>
              <Link
                href={`/servicios/${service.slug}`}
                className="border-border hover:bg-surface-2 focus-visible:ring-ring group flex h-full flex-col rounded-lg border p-5 transition-colors outline-none focus-visible:ring-2"
              >
                <DynamicIcon name={service.icon} className="text-brand-red-600 mb-4 size-7" />
                <h3 className="text-[15px] leading-snug font-semibold">{service.name}</h3>
                {service.priceFrom !== null ? (
                  <p className="tabular-nums-price text-muted-foreground mt-auto pt-3 text-sm">
                    Desde{" "}
                    <span className="text-foreground font-medium">
                      {formatPrice(service.priceFrom)}
                    </span>
                  </p>
                ) : null}
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-6 sm:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/servicios">
              Ver todos los servicios <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
