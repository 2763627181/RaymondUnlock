"use client";

import { ChevronUp } from "lucide-react";
import { ItemRow } from "@/components/wholesale/item-row";
import type { CategoryGroup } from "@/lib/wholesale/filter";
import { cn } from "@/lib/utils";

/** Una categoría que se despliega: barra con su nombre y, abierta, los productos de esa categoría. */
export function CategorySection({
  group,
  open,
  onToggle,
  index,
}: {
  group: CategoryGroup;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const panelId = `categoria-${index}`;

  return (
    <section>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="bg-surface-2 border-border focus-visible:ring-ring flex w-full items-center gap-3 border-b px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset"
        >
          <span aria-hidden="true" className="bg-brand-red h-5 w-1 shrink-0 rounded-full" />
          <span className="flex-1 text-sm font-bold tracking-wide uppercase">{group.category}</span>
          <span className="text-muted-foreground text-xs tabular-nums">{group.items.length}</span>
          <ChevronUp
            aria-hidden="true"
            className={cn(
              "text-muted-foreground size-5 transition-transform",
              !open && "rotate-180",
            )}
          />
        </button>
      </h2>
      {open ? (
        <ul id={panelId}>
          {group.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
