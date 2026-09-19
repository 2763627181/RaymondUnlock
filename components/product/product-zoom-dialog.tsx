"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ProductImage } from "@/types/catalog";

export function ProductZoomDialog({
  open,
  onOpenChange,
  image,
  name,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ProductImage | null;
  name: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">Imagen ampliada del producto</DialogDescription>
        {image ? (
          <div className="relative aspect-square w-full touch-pinch-zoom">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-contain"
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
