"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import type { NavCategory } from "@/types/site";
import { menuDropdownVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CLOSE_DELAY = 150;

export function MegaMenu({ categories }: { categories: NavCategory[] }) {
  const [active, setActive] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function open(slug: string) {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActive(slug);
  }

  // El header es sticky: si el usuario hace scroll sin mover el mouse fuera
  // del trigger, el panel se queda flotando sobre el contenido. Se cierra
  // al primer scroll para evitar ese solape.
  useEffect(() => {
    if (!active) return;
    const closeOnScroll = () => setActive(null);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [active]);

  function scheduleClose() {
    closeTimeout.current = setTimeout(() => setActive(null), CLOSE_DELAY);
  }

  const activeCategory = categories.find((category) => category.slug === active) ?? null;

  return (
    <nav
      className="hidden items-center gap-1 lg:flex"
      onMouseLeave={scheduleClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActive(null);
      }}
    >
      {categories.map((category) => (
        <div key={category.slug} onMouseEnter={() => open(category.slug)}>
          <Link
            href={category.href}
            onFocus={() => open(category.slug)}
            className={cn(
              "text-ink-700 hover:text-brand-red rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active === category.slug && "text-brand-red",
            )}
          >
            {category.name}
          </Link>
        </div>
      ))}

      <AnimatePresence>
        {activeCategory ? (
          <m.div
            key={activeCategory.slug}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuDropdownVariants}
            onMouseEnter={() => open(activeCategory.slug)}
            className="border-border bg-surface absolute inset-x-0 top-full border-t shadow-[0_8px_24px_rgba(0,0,0,.06)]"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-[clamp(1rem,4vw,2rem)] py-8">
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                  Categorías
                </p>
                <ul className="space-y-2">
                  {activeCategory.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <Link href={sub.href} className="text-ink-700 hover:text-brand-red text-sm">
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {activeCategory.brands.length > 0 ? (
                <div>
                  <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                    Marcas
                  </p>
                  <ul className="space-y-2">
                    {activeCategory.brands.map((brand) => (
                      <li key={brand.slug}>
                        <Link
                          href={brand.href}
                          className="text-ink-700 hover:text-brand-red text-sm"
                        >
                          {brand.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div aria-hidden="true" />
              )}

              {activeCategory.promo ? (
                <Link
                  href={activeCategory.promo.href}
                  className="from-ink to-ink-700 flex flex-col justify-end rounded-lg bg-gradient-to-br p-5 text-white transition-opacity hover:opacity-90"
                >
                  <p className="text-lg font-semibold">{activeCategory.promo.title}</p>
                  <p className="text-sm text-white/80">{activeCategory.promo.subtitle}</p>
                </Link>
              ) : null}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
