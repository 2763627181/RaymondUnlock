"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/layout/logo";
import { PriceViewSwitch } from "@/components/layout/price-view-switch";
import { useViewerStore } from "@/lib/viewer/store";
import type { NavCategory, NavLink as NavLinkItem } from "@/types/site";

export function MobileNavPanel({
  open,
  onOpenChange,
  categories,
  secondaryLinks,
  wholesaleLink,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: NavCategory[];
  secondaryLinks: NavLinkItem[];
  wholesaleLink: NavLinkItem;
}) {
  const close = () => onOpenChange(false);
  const status = useViewerStore((state) => state.status);
  const loggedIn = status !== "unknown" && status !== "anonymous";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full max-w-xs">
        <SheetHeader className="border-border border-b">
          <SheetTitle>Menú</SheetTitle>
          <Logo />
        </SheetHeader>

        <nav className="flex flex-col overflow-y-auto px-4 pb-4" aria-label="Menú principal">
          <PriceViewSwitch className="flex py-3" labelClassName="inline" />
          <Accordion type="single" collapsible className="w-full">
            {categories.map((category) => (
              <AccordionItem key={category.slug} value={category.slug}>
                <AccordionTrigger headingLevel={2}>{category.name}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {[
                      { slug: "todo", name: `Ver todo en ${category.name}`, href: category.href },
                      ...category.subcategories,
                    ].map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={sub.href}
                          onClick={close}
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
                onClick={close}
                className="py-2.5 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href={wholesaleLink.href}
              onClick={close}
              className="text-brand-red-600 py-2.5 text-sm font-semibold"
            >
              {wholesaleLink.name}
            </Link>
            <Link
              href={loggedIn ? "/cuenta" : "/login"}
              onClick={close}
              className="border-border mt-2 border-t py-2.5 pt-4 text-sm font-medium"
            >
              {loggedIn ? "Mi cuenta" : "Iniciar sesión"}
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
