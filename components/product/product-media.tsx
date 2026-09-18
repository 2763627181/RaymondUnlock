import Image from "next/image";
import { ProductArt } from "@/components/product/product-art";
import { cn } from "@/lib/utils";

/** Foto del producto o, si todavía no tiene, la ilustración teñida con su color. */
export function ProductMedia({
  imageUrl,
  alt,
  icon,
  color,
  sizes,
  priority = false,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  icon: string | null;
  color?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!imageUrl) {
    return <ProductArt icon={icon} color={color} label={alt} className={className} />;
  }
  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
