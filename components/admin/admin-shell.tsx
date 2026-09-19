"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ADMIN_NAV, type AdminCounts } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

function AdminNav({ counts, onNavigate }: { counts: AdminCounts; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel de administración" className="flex flex-col gap-0.5 p-3">
      {ADMIN_NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const count = item.badge ? counts[item.badge] : 0;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus-visible:ring-2",
              active ? "bg-ink text-surface" : "text-ink-700 hover:bg-surface-2",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {count > 0 ? (
              <span
                className="bg-brand-red-600 min-w-5 rounded-full px-1.5 text-center text-xs font-semibold text-white"
                aria-label={`${count} pendientes`}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  counts,
  userName,
}: {
  children: ReactNode;
  counts: AdminCounts;
  userName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-surface-2 min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="bg-surface border-border sticky top-0 hidden h-dvh flex-col border-r lg:flex">
        <div className="border-border flex h-16 items-center gap-2 border-b px-5">
          <Logo />
          <span className="bg-surface-2 text-muted-foreground rounded px-1.5 py-0.5 text-[11px] font-medium">
            Panel
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AdminNav counts={counts} />
        </div>
        <div className="border-border space-y-2 border-t p-3">
          <p className="text-muted-foreground truncate px-1 text-xs">{userName}</p>
          <LogoutButton className="h-9 w-full" />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="bg-surface border-border sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú del panel"
              onClick={() => setMenuOpen(true)}
            >
              <Menu aria-hidden="true" />
            </Button>
            <Logo compact />
          </div>
          <div className="hidden lg:block" />
          <Button asChild variant="outline" className="h-9">
            <Link href="/" target="_blank" rel="noopener">
              Ver tienda <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-full max-w-xs">
          <SheetHeader className="border-border border-b">
            <SheetTitle>Panel</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            <AdminNav counts={counts} onNavigate={() => setMenuOpen(false)} />
            <div className="border-border space-y-2 border-t p-3">
              <p className="text-muted-foreground truncate px-1 text-xs">{userName}</p>
              <LogoutButton className="h-9 w-full" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
