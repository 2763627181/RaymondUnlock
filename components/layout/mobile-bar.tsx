"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Tienda", href: "/tienda", icon: Store },
  { name: "Carrito", href: "/carrito", icon: ShoppingBag },
];

export function MobileBar({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola, tengo una consulta sobre un producto de Raymond Unlock.",
  )}`;

  return (
    <nav
      aria-label="Navegación rápida"
      className="bg-surface border-border fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs font-medium",
                active ? "text-brand-red-600" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-success-700 flex flex-col items-center gap-1 py-2 text-xs font-medium"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
