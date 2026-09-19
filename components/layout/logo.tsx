import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark tipográfico temporal: el cliente solo entregó el logo en PNG con
 * fondo blanco (ver README). Se reemplaza por <Image src="/brand/logo.png">
 * en cuanto tengamos el archivo con fondo transparente o el SVG original.
 */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-0.5 font-semibold tracking-tight transition-all",
        compact ? "text-lg" : "text-xl",
        className,
      )}
    >
      <span className="text-ink">Raymond</span>
      <span className="text-brand-red">Unlock</span>
    </Link>
  );
}
