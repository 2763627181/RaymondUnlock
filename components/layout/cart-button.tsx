import Link from "next/link";
import { ShoppingBag } from "lucide-react";

/**
 * Visual únicamente en la Fase 1. El contador real y el badge animado
 * (aria-live, spring pop) se conectan al store de carrito en la Fase 6.
 */
export function CartButton() {
  return (
    <Link
      href="/carrito"
      aria-label="Carrito de compras"
      className="hover:bg-muted relative flex size-9 items-center justify-center rounded-md transition-colors"
    >
      <ShoppingBag className="text-ink-700 size-5" aria-hidden="true" />
    </Link>
  );
}
