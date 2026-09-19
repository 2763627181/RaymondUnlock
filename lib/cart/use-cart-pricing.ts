import { useMemo } from "react";
import { priceCartForDisplay } from "@/lib/cart/display-pricing";
import type { CartItem } from "@/lib/cart/store";
import { selectCanSeeWholesale, useViewerStore } from "@/lib/viewer/store";

/** Precios del carrito según quién es el visitante (unidad, o mayorista aprobado). */
export function useCartPricing(items: CartItem[]) {
  const terms = useViewerStore((state) => (selectCanSeeWholesale(state) ? state.wholesale : null));
  return useMemo(() => priceCartForDisplay(items, terms), [items, terms]);
}
