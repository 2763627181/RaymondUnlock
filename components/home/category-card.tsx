"use client";

import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { ProductArt } from "@/components/product/product-art";
import { categoryHoverVariants } from "@/lib/motion";
import type { Category } from "@/types/catalog";

export function CategoryCard({ category }: { category: Category }) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div initial="rest" whileHover={reduceMotion ? undefined : "hover"} animate="rest">
      <Link
        href={`/tienda/${category.slug}`}
        className="group focus-visible:ring-ring block rounded-lg outline-none focus-visible:ring-2"
      >
        <div className="bg-surface-2 relative aspect-square overflow-hidden rounded-lg">
          <m.div variants={categoryHoverVariants} className="absolute inset-0 p-9">
            <ProductArt icon={category.icon} color="#33363D" label="" />
          </m.div>
        </div>
        <p className="mt-3 text-center text-sm font-medium">{category.name}</p>
      </Link>
    </m.div>
  );
}
