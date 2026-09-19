"use client";

import { useEffect, useRef } from "react";
import { m, useReducedMotion, useSpring, useTransform } from "motion/react";
import { formatPrice } from "@/lib/format";

/** Monto que "corre" hasta su nuevo valor. Debe montarse ya con el valor real (no con 0). */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(value, { stiffness: 140, damping: 26 });
  const text = useTransform(spring, (latest) => formatPrice(Math.round(latest)));
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current || reduceMotion) {
      spring.jump(value);
      mounted.current = true;
    } else {
      spring.set(value);
    }
  }, [value, spring, reduceMotion]);

  return <m.span className={className}>{text}</m.span>;
}
