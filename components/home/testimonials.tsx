"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Container } from "@/components/layout/container";
import type { Testimonial } from "@/types/site";

const arrowClass =
  "flex size-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 outline-none";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild;
    const step = card instanceof HTMLElement ? card.offsetWidth + 16 : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <section className="bg-ink text-surface py-16 sm:py-20" aria-label="Opiniones de clientes">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Opinión anterior"
              onClick={() => scrollByCard(-1)}
              className={arrowClass}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Opinión siguiente"
              onClick={() => scrollByCard(1)}
              className={arrowClass}
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <ul
          ref={trackRef}
          className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <li
              key={item.id}
              className="w-[85%] shrink-0 snap-start rounded-lg border border-white/10 bg-white/5 p-6 sm:w-[26rem]"
            >
              <Quote className="mb-4 size-6 text-white/40" aria-hidden="true" />
              <blockquote className="text-[15px] leading-relaxed text-white/85">
                “{item.quote}”
              </blockquote>
              <p className="mt-5 text-sm font-medium">{item.name}</p>
              <p className="text-[13px] text-white/60">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
