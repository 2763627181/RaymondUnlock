"use client";

import { ChevronRight, ShoppingCart } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { formatPrice } from "@/lib/format";
import { wholesaleCount, wholesaleTotal, useWholesaleCart } from "@/lib/wholesale/cart";

/** Barra negra flotante sobre el menú de abajo: cuántos productos hay y el total. */
export function OrderBar({ visible, onOpen }: { visible: boolean; onOpen: () => void }) {
  const lines = useWholesaleCart((state) => state.lines);
  const count = wholesaleCount(lines);

  return (
    <AnimatePresence>
      {visible && count > 0 ? (
        <m.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed inset-x-0 bottom-[84px] z-30"
        >
          <div className="mx-auto max-w-3xl px-4">
            <button
              type="button"
              onClick={onOpen}
              className="bg-ink pointer-events-auto flex h-14 w-full items-center gap-3 rounded-2xl px-4 text-white shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="relative">
                <ShoppingCart className="size-5" aria-hidden="true" />
                <span className="bg-brand-red absolute -top-2 -right-2.5 grid min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold">
                  {count}
                </span>
              </span>
              <span className="flex-1 text-left font-semibold">Ver pedido</span>
              <span className="tabular-nums-price text-base font-bold">
                {formatPrice(wholesaleTotal(lines))}
              </span>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
