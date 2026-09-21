"use client";

import type { ComponentType } from "react";
import { Ellipsis, List, Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListingTab = "listado" | "buscar" | "pedido" | "mas";

const TABS: { id: ListingTab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "listado", label: "Listado", icon: List },
  { id: "buscar", label: "Buscar", icon: Search },
  { id: "pedido", label: "Pedido", icon: ShoppingCart },
  { id: "mas", label: "Más", icon: Ellipsis },
];

/** Menú de abajo, como una app: Listado, Buscar, Pedido (con el número de productos) y Más. */
export function BottomNav({
  active,
  count,
  onSelect,
}: {
  active: ListingTab;
  count: number;
  onSelect: (tab: ListingTab) => void;
}) {
  return (
    <nav
      aria-label="Menú del listado"
      className="bg-surface border-border fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4 px-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? "page" : undefined}
                className="focus-visible:ring-ring flex w-full flex-col items-center gap-1 py-2.5 outline-none focus-visible:ring-2"
              >
                <span
                  className={cn(
                    "relative grid h-8 w-14 place-items-center rounded-xl transition-colors",
                    isActive ? "bg-brand-red/10 text-brand-red-600" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {id === "pedido" && count > 0 ? (
                    <span className="bg-brand-red absolute top-0 right-2 grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-brand-red-600" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
