"use client";

import { useState } from "react";
import Link from "next/link";
import { m, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/layout/container";
import { SearchDialog } from "@/components/layout/search-dialog";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartButton } from "@/components/layout/cart-button";
import type { NavCategory, NavLink } from "@/types/site";

export function Header({
  categories,
  secondaryLinks,
  wholesaleLink,
}: {
  categories: NavCategory[];
  secondaryLinks: NavLink[];
  wholesaleLink: NavLink;
}) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const paddingY = useTransform(scrollY, [0, 80], [20, 10]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  return (
    <header
      className={
        "bg-surface/95 sticky top-0 z-40 border-b backdrop-blur-sm transition-colors " +
        (scrolled ? "border-border" : "border-transparent")
      }
    >
      <Container>
        <m.div
          style={{ paddingTop: paddingY, paddingBottom: paddingY }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <MobileNav
              categories={categories}
              secondaryLinks={secondaryLinks}
              wholesaleLink={wholesaleLink}
            />
            <Logo compact={scrolled} />
          </div>

          <MegaMenu categories={categories} />

          <div className="hidden items-center gap-1 lg:flex">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-700 hover:text-brand-red rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={wholesaleLink.href}
              className="text-brand-red hover:text-brand-red-600 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
            >
              {wholesaleLink.name}
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <SearchDialog />
            <CartButton />
          </div>
        </m.div>
      </Container>
    </header>
  );
}
