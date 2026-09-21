"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { AnimatedPrice } from "@/components/cart/animated-price";
import { CartLine } from "@/components/cart/cart-line";
import { QuoteForm } from "@/components/cart/quote-form-lazy";
import { Button } from "@/components/ui/button";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart/store";
import { useIsClient } from "@/lib/use-is-client";

function EmptyCart() {
  return (
    <div className="border-border flex flex-col items-center rounded-lg border border-dashed px-6 py-20 text-center">
      <ShoppingBag className="text-muted-foreground mb-4 size-10" aria-hidden="true" />
      <h2 className="text-xl font-semibold">Tu cotización está vacía</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-[15px] leading-relaxed">
        Agrega productos desde la tienda y pide tu cotización por WhatsApp o correo.
      </p>
      <Button asChild className="mt-6 h-11 px-6 text-base">
        <Link href="/tienda">Ir a la tienda</Link>
      </Button>
    </div>
  );
}

function ClearCartButton() {
  const clear = useCartStore((state) => state.clear);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-2"
      >
        Vaciar carrito
      </button>
    );
  }
  return (
    <span className="flex items-center gap-3 text-sm">
      ¿Vaciar todo?
      <button
        type="button"
        onClick={clear}
        className="text-brand-red-600 font-medium underline underline-offset-2"
      >
        Sí, vaciar
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="underline underline-offset-2"
      >
        Cancelar
      </button>
    </span>
  );
}

export function CartPage() {
  const isClient = useIsClient();
  const items = useCartStore((state) => state.items);
  const subtotal = cartSubtotal(items);

  if (!isClient) {
    return <div className="skeleton h-96 w-full" role="status" aria-label="Cargando carrito" />;
  }
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14">
      <section aria-labelledby="productos-titulo">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h2 id="productos-titulo" className="text-lg font-semibold">
            Productos ({cartCount(items)})
          </h2>
          <ClearCartButton />
        </div>
        <ul className="border-border border-t">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item) => (
              <CartLine key={item.variantId} item={item} />
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <aside className="space-y-6 self-start lg:sticky lg:top-24">
        <div className="bg-surface-2 rounded-lg p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground text-sm">Subtotal</span>
            <AnimatedPrice value={subtotal} className="tabular-nums-price text-2xl font-semibold" />
          </div>
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
            Precios sujetos a confirmación y disponibilidad. Recalculamos el total al enviar la
            cotización.
          </p>
        </div>
        <QuoteForm />
      </aside>
    </div>
  );
}
