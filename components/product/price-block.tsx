"use client";

import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { discountPercent, formatPrice } from "@/lib/format";
import { valueSwapReducedVariants, valueSwapVariants } from "@/lib/motion";
import { useViewerStore } from "@/lib/viewer/store";
import { useWholesaleTerms } from "@/lib/viewer/use-wholesale";
import type { CatalogVariant } from "@/types/catalog";

const LOW_STOCK_THRESHOLD = 3;

function stockLabel(stock: number): { text: string; className: string } {
  if (stock <= 0) return { text: "Agotado", className: "text-muted-foreground" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { text: "Últimas unidades", className: "text-brand-red-600" };
  return { text: "Disponible", className: "text-success-700" };
}

function WholesaleAccess({ hasTerms }: { hasTerms: boolean }) {
  const status = useViewerStore((state) => state.status);
  if (hasTerms) return null;

  if (status === "wholesale_pending") {
    return (
      <p className="text-muted-foreground mt-2 text-[13px]">
        Tu solicitud de cuenta al por mayor está en revisión.
      </p>
    );
  }

  const loggedIn = status === "customer" || status === "wholesale_rejected";
  return (
    <Link
      href={loggedIn ? "/cuenta" : "/mayorista"}
      className="text-brand-blue mt-2 inline-block text-[13px] hover:underline"
    >
      ¿Compras al por mayor? Solicita acceso
    </Link>
  );
}

export function PriceBlock({ variant }: { variant: CatalogVariant }) {
  const reduceMotion = useReducedMotion();
  const terms = useWholesaleTerms(variant.id);
  const compareAt =
    variant.compareAtPrice !== null && variant.compareAtPrice > variant.priceRetail
      ? variant.compareAtPrice
      : null;
  const discount = discountPercent(compareAt, variant.priceRetail);
  const stock = stockLabel(variant.stock);
  const savings = terms ? variant.priceRetail - terms.price : 0;
  const savingsPercent = terms ? discountPercent(variant.priceRetail, terms.price) : null;

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

      {terms ? (
        <m.div
          key={`wholesale-${variant.id}`}
          initial="hidden"
          animate="visible"
          variants={reduceMotion ? valueSwapReducedVariants : valueSwapVariants}
          className="border-success-700/30 bg-success-700/5 tabular-nums-price mt-4 rounded-lg border p-3.5"
        >
          <p className="text-success-700 text-2xl font-semibold">
            {formatPrice(terms.price)}{" "}
            <span className="text-sm font-medium">precio al por mayor</span>
          </p>
          <p className="text-muted-foreground mt-1 text-[13px]">
            Desde {terms.minQty} {terms.minQty === 1 ? "unidad" : "unidades"}
            {savings > 0
              ? ` · Ahorras ${formatPrice(savings)} por unidad${savingsPercent ? ` (${savingsPercent}%)` : ""}`
              : ""}
          </p>
        </m.div>
      ) : null}

      <p className={`mt-3 text-sm font-medium ${stock.className}`}>{stock.text}</p>
      <WholesaleAccess hasTerms={terms !== null} />
    </div>
  );
}
