import { Container } from "@/components/layout/container";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { SectionHeading } from "@/components/home/section-heading";
import { DynamicIcon } from "@/lib/icons";
import type { IconCopy } from "@/types/site";

export function WhyUs({ items }: { items: IconCopy[] }) {
  return (
    <section className="bg-surface-2 py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="¿Por qué Raymond Unlock?"
          description="Compra con confianza y con alguien que responde después de la venta."
        />
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <StaggerItem key={item.title}>
              <div className="bg-surface border-border h-full rounded-lg border p-6">
                <span className="text-ink bg-surface-2 mb-4 flex size-11 items-center justify-center rounded-full">
                  <DynamicIcon name={item.icon} className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-[15px] leading-relaxed">
                  {item.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
