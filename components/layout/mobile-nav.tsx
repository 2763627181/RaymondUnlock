"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import type { NavCategory, NavLink as NavLinkItem } from "@/types/site";

const MobileNavPanel = dynamic(
  () => import("@/components/layout/mobile-nav-panel").then((module) => module.MobileNavPanel),
  { ssr: false },
);

/** El panel (Sheet + Accordion) se descarga la primera vez que se abre el menú. */
export function MobileNav(props: {
  categories: NavCategory[];
  secondaryLinks: NavLinkItem[];
  wholesaleLink: NavLinkItem;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        className="hover:bg-muted flex size-9 items-center justify-center rounded-md lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      {loaded ? <MobileNavPanel open={open} onOpenChange={setOpen} {...props} /> : null}
    </>
  );
}
