import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Buscador de productos del panel: por código, ID o nombre. Funciona sin JavaScript (GET). */
export function AdminSearchForm({
  defaultValue = "",
  autoFocus = false,
  className,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <form action="/admin/buscar" method="get" role="search" className={cn("relative", className)}>
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        maxLength={80}
        autoComplete="off"
        placeholder="Buscar por código, ID o nombre…"
        aria-label="Buscar producto por código, ID o nombre"
        className="border-input bg-surface focus-visible:ring-ring h-10 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
      />
    </form>
  );
}
