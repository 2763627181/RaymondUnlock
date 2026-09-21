"use client";

import { useState } from "react";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceBlock } from "@/components/product/price-block";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { UnitDetails } from "@/components/product/unit-details";
import { VariantSelector } from "@/components/product/variant-selector";
import { variantLabel } from "@/lib/catalog/cards";
import { CONDITION_LABELS } from "@/lib/catalog/text";
import { useCartStore } from "@/lib/cart/store";
import { formatMoney } from "@/lib/format";
import { absoluteUrl } from "@/lib/seo";
import { buildProductInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CatalogVariant, ProductCondition } from "@/types/catalog";

export interface PurchaseProduct {
  slug: string;
  name: string;
  brandName: string | null;
  shortDescription: string | null;
  condition: ProductCondition;
  categoryIcon: string | null;
  primaryImageUrl: string | null;
}

export function PurchasePanel({
  product,
  variants,
  selected,
  onSelect,
  whatsappNumber,
}: {
  product: PurchaseProduct;
  variants: CatalogVariant[];
  selected: CatalogVariant;
  onSelect: (variant: CatalogVariant) => void;
  whatsappNumber: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.add);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const outOfStock = selected.stock <= 0;
  const label = variantLabel(selected);
  const facts = {
    condition: product.condition,
    capacity: selected.capacity,
    color: selected.color,
    batteryHealth: selected.batteryHealth,
    unlockType: selected.unlockType,
    code: selected.sku,
  };

  const inquiryUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildProductInquiryMessage({
      productName: product.name,
      facts,
      priceLabel: formatMoney(selected.priceRetail),
      productUrl: absoluteUrl(`/producto/${product.slug}`),
    }),
  );

  function handleAdd() {
    addToCart(
      {
        variantId: selected.id,
        snapshot: {
          productName: product.name,
          productSlug: product.slug,
          variantLabel: label,
          unitPrice: selected.priceRetail,
          imageUrl: product.primaryImageUrl,
          icon: product.categoryIcon,
          colorHex: selected.colorHex,
        },
      },
      quantity,
    );
    setDrawerOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          {product.brandName ? (
            <p className="text-muted-foreground text-sm">{product.brandName}</p>
          ) : null}
          {product.condition !== "nuevo" ? (
            <Badge variant="outline">{CONDITION_LABELS[product.condition]}</Badge>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {product.name}
        </h1>
        {product.shortDescription ? (
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
            {product.shortDescription}
          </p>
        ) : null}
      </div>

      <PriceBlock variant={selected} />

      <VariantSelector variants={variants} selected={selected} onSelect={onSelect} />

      <UnitDetails facts={facts} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button className="h-12 flex-1 text-base" disabled={outOfStock} onClick={handleAdd}>
            <ShoppingBag aria-hidden="true" />
            {outOfStock ? "Agotado" : "Agregar a la cotización"}
          </Button>
        </div>
        <Button asChild variant="outline" className="h-12 text-base">
          <a href={inquiryUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" />
            Pedir por WhatsApp
          </a>
        </Button>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Precios sujetos a confirmación y disponibilidad.
        </p>
      </div>
    </div>
  );
}
