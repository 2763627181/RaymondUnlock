import "server-only";
import type { ProductImage } from "@/types/catalog";

/**
 * Solo un producto de ejemplo trae imágenes, para poder probar la galería.
 * El resto usa la ilustración de respaldo hasta que se suban fotos reales.
 */
export const productImages: ProductImage[] = [
  {
    id: "img-iphone-15-pro-1",
    productId: "prod-iphone-15-pro",
    variantId: null,
    url: "/seed/phone-back.svg",
    alt: "iPhone 15 Pro visto por detrás (ilustración de ejemplo)",
    sortOrder: 1,
  },
  {
    id: "img-iphone-15-pro-2",
    productId: "prod-iphone-15-pro",
    variantId: null,
    url: "/seed/phone-front.svg",
    alt: "iPhone 15 Pro visto de frente (ilustración de ejemplo)",
    sortOrder: 2,
  },
];
