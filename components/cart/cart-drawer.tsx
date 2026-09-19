"use client";

import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { AnimatedPrice } from "@/components/cart/animated-price";
import { CartLine } from "@/components/cart/cart-line";
import { Button } from "@/components/ui/button";
import { cartCount, useCartStore } from "@/lib/cart/store";
import { useCartPricing } from "@/lib/cart/use-cart-pricing";
import { REDUCED_MOTION_DURATION, drawerSpring } from "@/lib/motion";
import { useIsClient } from "@/lib/use-is-client";

export function CartDrawer() {
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const open = useCartStore((state) => state.drawerOpen);
  const setOpen = useCartStore((state) => state.setDrawerOpen);
  const items = useCartStore((state) => state.items);
  const { lines, subtotal } = useCartPricing(items);

  const close = () => setOpen(false);
  const count = isClient ? cartCount(items) : 0;
  const panelTransition = reduceMotion ? { duration: REDUCED_MOTION_DURATION } : drawerSpring;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-50 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
              <m.aside
                className="bg-surface fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-2xl outline-none"
                initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
                animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
                transition={panelTransition}
              >
                <header className="border-border flex items-center justify-between border-b px-5 py-4">
                  <DialogPrimitive.Title className="text-lg font-semibold">
                    Tu cotización{count > 0 ? ` (${count})` : ""}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close
                    aria-label="Cerrar carrito"
                    className="hover:bg-surface-2 focus-visible:ring-ring flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </DialogPrimitive.Close>
                </header>

                {isClient && items.length > 0 ? (
                  <>
                    <ul className="flex-1 overflow-y-auto px-5">
                      <AnimatePresence initial={false} mode="popLayout">
                        {items.map((item) => {
                          const pricing = lines.get(item.variantId);
                          return pricing ? (
                            <CartLine
                              key={item.variantId}
                              item={item}
                              pricing={pricing}
                              onNavigate={close}
                            />
                          ) : null;
                        })}
                      </AnimatePresence>
                    </ul>
                    <footer className="border-border space-y-3 border-t px-5 py-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground text-sm">Subtotal</span>
                        <AnimatedPrice
                          value={subtotal}
                          className="tabular-nums-price text-xl font-semibold"
                        />
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Precios sujetos a confirmación y disponibilidad.
                      </p>
                      <Button asChild className="h-12 w-full text-base" onClick={close}>
                        <Link href="/carrito">Enviar cotización</Link>
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={close}>
                        Seguir comprando
                      </Button>
                    </footer>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                    <ShoppingBag className="text-muted-foreground size-10" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Tu cotización está vacía</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Agrega productos para pedir tu cotización por WhatsApp o correo.
                      </p>
                    </div>
                    <Button asChild onClick={close}>
                      <Link href="/tienda">Ir a la tienda</Link>
                    </Button>
                  </div>
                )}
              </m.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
