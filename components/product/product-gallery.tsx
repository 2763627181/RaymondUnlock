"use client";

import { useRef, useState, ViewTransition } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ProductMedia } from "@/components/product/product-media";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

export function ProductGallery({
  images,
  name,
  icon,
  color,
  transitionName,
}: {
  images: ProductImage[];
  name: string;
  icon: string | null;
  color: string | null;
  transitionName: string;
}) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState<ProductImage | null>(null);

  const views: (ProductImage | null)[] = images.length > 0 ? images : [null];
  const hasMany = views.length > 1;

  function goTo(target: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: target * track.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse">
      <div className="min-w-0 flex-1">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="bg-surface-2 flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto rounded-lg [&::-webkit-scrollbar]:hidden"
        >
          {views.map((image, viewIndex) => {
            const media = (
              <div className="relative size-full">
                <ProductMedia
                  imageUrl={image?.url ?? null}
                  alt={image?.alt ?? name}
                  icon={icon}
                  color={color}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  priority={viewIndex === 0}
                />
              </div>
            );
            return (
              <div
                key={image?.id ?? "ilustracion"}
                className="relative aspect-square w-full shrink-0 snap-center p-6 sm:p-10"
              >
                {viewIndex === 0 ? (
                  <ViewTransition name={transitionName} share="morph" default="none">
                    {media}
                  </ViewTransition>
                ) : (
                  media
                )}
                {image ? (
                  <button
                    type="button"
                    onClick={() => setZoomed(image)}
                    aria-label="Ampliar imagen"
                    className="focus-visible:ring-ring absolute inset-0 cursor-zoom-in rounded-lg outline-none focus-visible:ring-2"
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {hasMany ? (
          <div className="mt-3 flex justify-center gap-2 lg:hidden">
            {views.map((image, dotIndex) => (
              <button
                key={image?.id ?? dotIndex}
                type="button"
                aria-label={`Ver imagen ${dotIndex + 1} de ${views.length}`}
                aria-current={dotIndex === index}
                onClick={() => goTo(dotIndex)}
                className="flex size-5 items-center justify-center"
              >
                <span
                  className={cn(
                    "block size-2 rounded-full transition-colors",
                    dotIndex === index ? "bg-ink" : "bg-border",
                  )}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {hasMany ? (
        <ul className="hidden gap-3 lg:flex lg:w-20 lg:flex-col" aria-label="Miniaturas">
          {views.map((image, thumbIndex) => (
            <li key={image?.id ?? thumbIndex}>
              <button
                type="button"
                onClick={() => goTo(thumbIndex)}
                aria-label={`Ver imagen ${thumbIndex + 1}`}
                aria-current={thumbIndex === index}
                className={cn(
                  "bg-surface-2 focus-visible:ring-ring relative block aspect-square w-full overflow-hidden rounded-md border-2 outline-none focus-visible:ring-2",
                  thumbIndex === index ? "border-ink" : "border-transparent",
                )}
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={zoomed !== null} onOpenChange={(open) => !open && setZoomed(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada del producto</DialogDescription>
          {zoomed ? (
            <div className="relative aspect-square w-full touch-pinch-zoom">
              <Image
                src={zoomed.url}
                alt={zoomed.alt}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
