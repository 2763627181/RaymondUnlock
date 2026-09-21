"use client";

import { useState, ViewTransition } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/product/price-tag";
import { ProductMedia } from "@/components/product/product-media";
import { ColorSwatches } from "@/components/product/color-swatches";
import { CONDITION_LABELS } from "@/lib/catalog/text";
import { useCartStore } from "@/lib/cart/store";
import { badgePopVariants, getCardMotion } from "@/lib/motion";
import type { ProductCardData } from "@/types/catalog";

export function ProductCard({
  product,
  priority = false,
  headingLevel = 3,
}: {
  product: ProductCardData;
  priority?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const reduceMotion = useReducedMotion() ?? false;
  const motion = getCardMotion(reduceMotion);
  const addToCart = useCartStore((state) => state.add);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const [focused, setFocused] = useState(false);
  // Solo la tarjeta con la que se interactúa lleva el nombre de la transición
  // compartida: dos elementos con el mismo nombre en la página cancelan el morph.
  const [armed, setArmed] = useState(false);

  function handleQuickAdd() {
    if (!product.quickAddVariantId) return;
    addToCart({
      variantId: product.quickAddVariantId,
      snapshot: {
        productName: product.name,
        productSlug: product.slug,
        variantLabel: product.quickAddLabel,
        unitPrice: product.minPrice,
        imageUrl: product.imageUrl,
        icon: product.categoryIcon,
        colorHex: product.colors[0]?.hex ?? null,
      },
    });
    setDrawerOpen(true);
  }

  return (
    <m.article
      variants={motion.card}
      initial="rest"
      animate={focused ? "hover" : "rest"}
      whileHover="hover"
      onPointerEnter={() => setArmed(true)}
      onPointerDown={() => setArmed(true)}
      onPointerLeave={() => setArmed(false)}
      onFocus={() => {
        setFocused(true);
        setArmed(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
          setArmed(false);
        }
      }}
      className="group relative flex flex-col"
    >
      <div className="bg-surface-2 relative aspect-square overflow-hidden rounded-lg">
        <m.div
          variants={motion.image}
          className={`absolute inset-0 p-8 ${product.inStock ? "" : "opacity-60"}`}
        >
          <ViewTransition
            name={armed ? `product-${product.slug}` : undefined}
            share="morph"
            default="none"
          >
            <div className="relative size-full">
              <ProductMedia
                imageUrl={product.imageUrl}
                alt={product.imageAlt}
                icon={product.categoryIcon}
                color={product.colors[0]?.hex}
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
                priority={priority}
              />
            </div>
          </ViewTransition>
        </m.div>

        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {product.discountPercent ? (
            <m.span variants={badgePopVariants} initial="hidden" animate="visible">
              <Badge className="bg-brand-red-600 text-white">Promo</Badge>
            </m.span>
          ) : null}
          {product.condition !== "nuevo" ? (
            <Badge variant="outline" className="bg-surface">
              {CONDITION_LABELS[product.condition]}
            </Badge>
          ) : null}
        </div>

        {!product.inStock ? (
          <Badge variant="secondary" className="absolute top-2.5 right-2.5">
            Agotado
          </Badge>
        ) : null}

        <m.div
          variants={motion.action}
          className="pointer-events-none absolute inset-x-3 bottom-3 z-10 hidden pointer-fine:block"
        >
          {product.quickAddVariantId ? (
            <Button className="pointer-events-auto w-full" size="lg" onClick={handleQuickAdd}>
              Agregar
            </Button>
          ) : (
            <Button asChild variant="secondary" className="pointer-events-auto w-full" size="lg">
              <Link href={`/producto/${product.slug}`}>Ver opciones</Link>
            </Button>
          )}
        </m.div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        {product.brandName ? (
          <p className="text-muted-foreground text-xs">{product.brandName}</p>
        ) : null}
        <Heading className="text-sm leading-snug font-medium">
          <Link
            href={`/producto/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </Heading>
        <ColorSwatches colors={product.colors} className="mt-0.5" />
        <PriceTag
          minPrice={product.minPrice}
          maxPrice={product.maxPrice}
          compareAtPrice={product.compareAtPrice}
          discountPercent={product.discountPercent}
          className="mt-1"
        />
      </div>
    </m.article>
  );
}
