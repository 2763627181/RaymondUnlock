"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { cartCount, useCartStore } from "@/lib/cart/store";
import { badgePopVariants } from "@/lib/motion";
import { useIsClient } from "@/lib/use-is-client";

export function CartButton() {
  const isClient = useIsClient();
  const count = useCartStore((state) => cartCount(state.items));
  const visibleCount = isClient ? count : 0;

  return (
    <Link
      href="/carrito"
      aria-label={
        visibleCount > 0 ? `Carrito, ${visibleCount} artículos` : "Carrito de compras vacío"
      }
      className="hover:bg-muted relative flex size-9 items-center justify-center rounded-md transition-colors"
    >
      <ShoppingBag className="text-ink-700 size-5" aria-hidden="true" />
      <AnimatePresence>
        {visibleCount > 0 ? (
          <m.span
            key={visibleCount}
            variants={badgePopVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            aria-hidden="true"
            className="bg-brand-red-600 absolute -top-0.5 -right-0.5 flex min-w-4.5 items-center justify-center rounded-full px-1 text-[11px] leading-[18px] font-semibold text-white"
          >
            {visibleCount}
          </m.span>
        ) : null}
      </AnimatePresence>
      <span role="status" aria-live="polite" className="sr-only">
        {visibleCount > 0 ? `${visibleCount} artículos en el carrito` : ""}
      </span>
    </Link>
  );
}
