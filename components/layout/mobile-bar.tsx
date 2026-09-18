"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18099063114";
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hola, tengo una consulta sobre un producto de Raymond Unlock.",
)}`;

const items = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Tienda", href: "/tienda", icon: Store },
  { name: "Carrito", href: "/carrito", icon: ShoppingBag },
];

export function MobileBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="bg-surface border-border fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs font-medium",
                active ? "text-brand-red" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="text-success flex flex-col items-center gap-1 py-2 text-xs font-medium"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
