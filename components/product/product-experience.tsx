"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel, type PurchaseProduct } from "@/components/product/purchase-panel";
import { defaultVariant } from "@/lib/catalog/variants";
import type { CatalogVariant, ProductImage } from "@/types/catalog";

/** Galería y panel de compra comparten la variante elegida: cambiar el color cambia la imagen. */
export function ProductExperience({
  product,
  variants,
  images,
  whatsappNumber,
}: {
  product: PurchaseProduct;
  variants: CatalogVariant[];
  images: ProductImage[];
  whatsappNumber: string;
}) {
  const [selectedId, setSelectedId] = useState(() => defaultVariant(variants)?.id ?? null);
  const selected =
    variants.find((variant) => variant.id === selectedId) ?? defaultVariant(variants);
  if (!selected) return null;

  const variantImages = images.filter((image) => image.variantId === selected.id);
  const galleryImages =
    variantImages.length > 0 ? variantImages : images.filter((image) => image.variantId === null);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14">
      <ProductGallery
        key={variantImages.length > 0 ? selected.id : "general"}
        images={galleryImages}
        name={product.name}
        icon={product.categoryIcon}
        color={selected.colorHex}
        transitionName={`product-${product.slug}`}
      />
      <PurchasePanel
        product={product}
        variants={variants}
        selected={selected}
        onSelect={(variant) => setSelectedId(variant.id)}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
