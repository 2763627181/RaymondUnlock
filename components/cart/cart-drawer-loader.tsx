"use client";

import dynamic from "next/dynamic";
import { useCartStore } from "@/lib/cart/store";

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((module) => module.CartDrawer),
  { ssr: false },
);

/** El drawer (Radix + animaciones) no viaja en la carga inicial: se descarga al abrirlo por primera vez. */
export function CartDrawerLoader() {
  const mounted = useCartStore((state) => state.drawerMounted);
  return mounted ? <CartDrawer /> : null;
}
