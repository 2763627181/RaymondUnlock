"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { formatPrice } from "@/lib/format";
import {
  heroImageVariants,
  heroLineReducedVariants,
  heroLineVariants,
  heroSlideReducedVariants,
  heroSlideVariants,
  revealReducedVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types/site";

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 90]);

  const autoplay = !reduceMotion && !userPaused && !interacting && banners.length > 1;

  useEffect(() => {
    if (!autoplay) return;
    const timeout = setTimeout(
      () => setIndex((current) => (current + 1) % banners.length),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(timeout);
  }, [autoplay, index, banners.length]);

  const slideVariants = reduceMotion ? heroSlideReducedVariants : heroSlideVariants;
  const lineVariants = reduceMotion ? heroLineReducedVariants : heroLineVariants;
  const imageVariants = reduceMotion ? revealReducedVariants : heroImageVariants;

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carrusel"
      aria-label="Ofertas destacadas"
      className="bg-ink text-surface relative overflow-hidden"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
    >
      <Container className="grid pt-10 pb-24 sm:pt-14 lg:pb-28">
        {banners.map((banner, slideIndex) => {
          const active = slideIndex === index;
          return (
            <m.div
              key={banner.id}
              initial={false}
              animate={active ? "visible" : "hidden"}
              variants={slideVariants}
              inert={!active}
              aria-hidden={!active}
              aria-roledescription="diapositiva"
              aria-label={`${slideIndex + 1} de ${banners.length}`}
              className={cn(
                "col-start-1 row-start-1 grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
                !active && "pointer-events-none",
              )}
            >
              <div className="flex flex-col items-start gap-5">
                <m.p variants={lineVariants} className="text-sm font-medium text-white/60">
                  Raymond Unlock
                </m.p>
                <m.h2
                  variants={lineVariants}
                  className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                >
                  {banner.title}
                </m.h2>
                {banner.subtitle ? (
                  <m.p
                    variants={lineVariants}
                    className="max-w-md text-base leading-relaxed text-white/70"
                  >
                    {banner.subtitle}
                  </m.p>
                ) : null}
                {banner.fromPrice !== null ? (
                  <m.p variants={lineVariants} className="tabular-nums-price text-lg">
                    <span className="text-white/60">Desde </span>
                    <span className="font-semibold">{formatPrice(banner.fromPrice)}</span>
                  </m.p>
                ) : null}
                <m.div variants={lineVariants} className="flex flex-wrap gap-3 pt-1">
                  {banner.ctaHref ? (
                    <Button asChild className="h-11 px-6 text-base">
                      <Link href={banner.ctaHref}>{banner.ctaLabel ?? "Comprar"}</Link>
                    </Button>
                  ) : null}
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 border-white/25 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link href="/tienda">Ver más</Link>
                  </Button>
                </m.div>
              </div>

              <m.div
                style={{ y: parallaxY }}
                className="mx-auto w-full max-w-[26rem] lg:max-w-[32rem]"
              >
                <m.div variants={imageVariants} className="relative aspect-square">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    sizes="(min-width: 1024px) 512px, 90vw"
                    priority={slideIndex === 0}
                    className="object-contain"
                  />
                </m.div>
              </m.div>
            </m.div>
          );
        })}
      </Container>

      {banners.length > 1 ? (
        <div className="absolute inset-x-0 bottom-6">
          <Container className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {banners.map((banner, dotIndex) => (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`Ir a la diapositiva ${dotIndex + 1}: ${banner.title}`}
                  aria-current={dotIndex === index}
                  onClick={() => setIndex(dotIndex)}
                  className="flex size-6 items-center justify-center"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all",
                      dotIndex === index ? "bg-surface w-7" : "w-1.5 bg-white/35",
                    )}
                  />
                </button>
              ))}
            </div>
            {!reduceMotion ? (
              <button
                type="button"
                onClick={() => setUserPaused((paused) => !paused)}
                aria-label={userPaused ? "Reanudar carrusel" : "Pausar carrusel"}
                className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {userPaused ? (
                  <Play className="size-4" aria-hidden="true" />
                ) : (
                  <Pause className="size-4" aria-hidden="true" />
                )}
              </button>
            ) : null}
          </Container>
        </div>
      ) : null}
    </section>
  );
}
