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

/**
 * `immediate`: el elemento está sobre el pliegue, así que se pinta visible desde el HTML.
 * Si arrancara con opacity 0 esperaría al JS para aparecer y retrasaría el LCP.
 */
export function StaggerItem({
  children,
  className,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  if (immediate) return <div className={className}>{children}</div>;

  return (
    <m.div
      className={className}
      variants={shouldReduceMotion ? revealReducedVariants : staggerItemVariants}
    >
      {children}
    </m.div>
  );
}
