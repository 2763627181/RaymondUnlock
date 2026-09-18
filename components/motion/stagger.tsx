"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { staggerContainerVariants, staggerItemVariants, revealReducedVariants } from "@/lib/motion";

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainerVariants}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      variants={shouldReduceMotion ? revealReducedVariants : staggerItemVariants}
    >
      {children}
    </m.div>
  );
}
