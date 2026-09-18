import { Container } from "@/components/layout/container";
import { DynamicIcon } from "@/lib/icons";
import type { IconCopy } from "@/types/site";

export function GuaranteeStrip({ items }: { items: IconCopy[] }) {
  return (
    <section aria-label="Garantías y beneficios" className="border-border border-b">
      <Container>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="bg-surface-2 text-ink flex size-10 shrink-0 items-center justify-center rounded-full">
                <DynamicIcon name={item.icon} className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-muted-foreground text-[13px] leading-snug">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
