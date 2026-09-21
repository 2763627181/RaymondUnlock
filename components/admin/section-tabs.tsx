"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SectionTab {
  href: string;
  label: string;
  /** Solo se marca activa en esa ruta exacta (la primera pestaña). */
  exact?: boolean;
}

/** Pestañas de una sección del panel (enlaces: funcionan sin JavaScript y con "atrás"). */
export function SectionTabs({ tabs, label }: { tabs: SectionTab[]; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="border-border mb-6 flex gap-1 border-b">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring -mb-px border-b-2 px-4 py-2.5 text-sm font-medium outline-none focus-visible:ring-2",
              active
                ? "border-brand-red-600 text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
