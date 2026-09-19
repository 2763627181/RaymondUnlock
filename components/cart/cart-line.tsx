"use client";

import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { Trash2 } from "lucide-react";
import { ProductMedia } from "@/components/product/product-media";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { useCartStore, type CartItem } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";
import { cartLineReducedVariants, cartLineVariants } from "@/lib/motion";

export function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const reduceMotion = useReducedMotion();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const { snapshot } = item;

  return (
    <m.li
      layout={!reduceMotion}
      variants={reduceMotion ? cartLineReducedVariants : cartLineVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="border-border flex gap-4 border-b py-4 last:border-b-0"
    >
      <Link
        href={`/producto/${snapshot.productSlug}`}
        onClick={onNavigate}
        className="bg-surface-2 relative block size-20 shrink-0 overflow-hidden rounded-lg p-2"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className="relative size-full">
          <ProductMedia
            imageUrl={snapshot.imageUrl}
            alt=""
            icon={snapshot.icon}
            color={snapshot.colorHex}
            sizes="80px"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/producto/${snapshot.productSlug}`}
              onClick={onNavigate}
              className="text-sm leading-snug font-medium hover:underline"
            >
              {snapshot.productName}
            </Link>
            {snapshot.variantLabel ? (
              <p className="text-muted-foreground text-[13px]">{snapshot.variantLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => remove(item.variantId)}
            aria-label={`Quitar ${snapshot.productName} del carrito`}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            onChange={(quantity) => setQuantity(item.variantId, quantity)}
            label={`Cantidad de ${snapshot.productName}`}
          />
          <p className="tabular-nums-price text-sm font-semibold">
            {formatPrice(snapshot.unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </m.li>
  );
}
