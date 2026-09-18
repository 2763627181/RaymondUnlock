"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/layout/logo";
import type { NavCategory, NavLink as NavLinkItem } from "@/types/nav";

export function MobileNav({
  categories,
  secondaryLinks,
  wholesaleLink,
}: {
  categories: NavCategory[];
  secondaryLinks: NavLinkItem[];
  wholesaleLink: NavLinkItem;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú"
          className="hover:bg-muted flex size-9 items-center justify-center rounded-md lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs">
        <SheetHeader className="border-border border-b">
          <SheetTitle asChild>
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col overflow-y-auto px-4 pb-4">
          <Accordion type="single" collapsible className="w-full">
            {categories.map((category) => (
              <AccordionItem key={category.slug} value={category.slug}>
                <AccordionTrigger>{category.name}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {category.subcategories.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={sub.href}
                          onClick={() => setOpen(false)}
                          className="text-muted-foreground text-sm"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-2 flex flex-col gap-1">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={wholesaleLink.href}
              onClick={() => setOpen(false)}
              className="text-brand-red py-2.5 text-sm font-semibold"
            >
              {wholesaleLink.name}
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
