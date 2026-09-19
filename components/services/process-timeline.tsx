"use client";

import { m, useReducedMotion } from "motion/react";
import {
  lineGrowXVariants,
  lineGrowYVariants,
  revealReducedVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/motion";

export function ProcessTimeline({ steps }: { steps: { title: string; text: string }[] }) {
  const reduceMotion = useReducedMotion();
  const lineY = reduceMotion ? revealReducedVariants : lineGrowYVariants;
  const lineX = reduceMotion ? revealReducedVariants : lineGrowXVariants;
  const item = reduceMotion ? revealReducedVariants : staggerItemVariants;

  return (
    <m.ol
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainerVariants}
      className="relative grid gap-8 lg:grid-cols-4 lg:gap-6"
    >
      <m.span
        aria-hidden="true"
        variants={lineY}
        className="bg-border absolute top-5 bottom-5 left-5 w-px origin-top lg:hidden"
      />
      <m.span
        aria-hidden="true"
        variants={lineX}
        className="bg-border absolute top-5 right-[12.5%] left-[12.5%] hidden h-px origin-left lg:block"
      />
      {steps.map((step, index) => (
        <m.li
          key={step.title}
          variants={item}
          className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center"
        >
          <span className="bg-ink text-surface relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {index + 1}
          </span>
          <div>
            <h3 className="text-base font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-1 text-[15px] leading-relaxed">{step.text}</p>
          </div>
        </m.li>
      ))}
    </m.ol>
  );
}
