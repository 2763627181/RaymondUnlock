"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion } from "motion/react";
import {
  REDUCED_MOTION_DURATION,
  pageTransitionVariants,
  revealReducedVariants,
} from "@/lib/motion";
import { useIsClient } from "@/lib/use-is-client";

export default function Template({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  const reduceMotion = useReducedMotion();

  // La primera carga se sirve ya visible (no penaliza el LCP); solo las
  // navegaciones posteriores hacen la transición.
  return (
    <m.div
      initial={isClient ? "hidden" : false}
      animate="visible"
      variants={reduceMotion ? revealReducedVariants : pageTransitionVariants}
      transition={reduceMotion ? { duration: REDUCED_MOTION_DURATION } : undefined}
    >
      {children}
    </m.div>
  );
}
