"use client";

import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { discountPercent, formatPrice } from "@/lib/format";
import { valueSwapReducedVariants, valueSwapVariants } from "@/lib/motion";
import type { CatalogVariant } from "@/types/catalog";

const LOW_STOCK_THRESHOLD = 3;

function stockLabel(stock: number): { text: string; className: string } {
  if (stock <= 0) return { text: "Agotado", className: "text-muted-foreground" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { text: "Últimas unidades", className: "text-brand-red-600" };
  return { text: "Disponible", className: "text-success-700" };
}

export function PriceBlock({ variant }: { variant: CatalogVariant }) {
  const reduceMotion = useReducedMotion();
  const compareAt =
    variant.compareAtPrice !== null && variant.compareAtPrice > variant.priceRetail
      ? variant.compareAtPrice
      : null;
  const discount = discountPercent(compareAt, variant.priceRetail);
  const stock = stockLabel(variant.stock);

  return (
    <div>
      <m.div
        key={variant.id}
        initial="hidden"
        animate="visible"
        variants={reduceMotion ? valueSwapReducedVariants : valueSwapVariants}
        className="tabular-nums-price flex flex-wrap items-baseline gap-x-3 gap-y-1"
      >
        <span
          className={`text-3xl font-semibold tracking-tight ${compareAt ? "text-brand-red-600" : ""}`}
        >
          {formatPrice(variant.priceRetail)}
        </span>
        {compareAt ? (
          <span className="text-muted-foreground text-lg line-through">
            {formatPrice(compareAt)}
          </span>
        ) : null}
        {discount ? <Badge className="bg-brand-red-600 text-white">−{discount}%</Badge> : null}
      </m.div>
      <p className="text-muted-foreground mt-1 text-xs">Precio por unidad</p>
      <p className={`mt-3 text-sm font-medium ${stock.className}`}>{stock.text}</p>
      <Link
        href="/mayorista"
        className="text-brand-blue mt-2 inline-block text-[13px] hover:underline"
      >
        ¿Compras al por mayor? Solicita acceso
      </Link>
    </div>
  );
}
