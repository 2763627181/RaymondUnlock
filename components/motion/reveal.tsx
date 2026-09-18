"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  revealVariants,
  revealReducedVariants,
  DURATION,
  EASE_DEFAULT,
  REDUCED_MOTION_DURATION,
} from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={shouldReduceMotion ? revealReducedVariants : revealVariants}
      transition={
        shouldReduceMotion
          ? { duration: REDUCED_MOTION_DURATION }
          : { duration: DURATION.enter, ease: EASE_DEFAULT, delay }
      }
    >
      {children}
    </m.div>
  );
}
