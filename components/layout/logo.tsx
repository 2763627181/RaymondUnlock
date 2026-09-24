import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Dimensiones reales de public/brand/logo.png (ya recortado, sin margen transparente
// sobrante): next/image las usa para reservar el espacio y no saltar el layout.
const WIDTH = 2103;
const HEIGHT = 697;

/** El logo del negocio (imagen con fondo transparente), enlazado al inicio. */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image
        src="/brand/logo.png"
        alt="Raymond Unlock, celulares y más"
        width={WIDTH}
        height={HEIGHT}
        priority
        className={cn("w-auto transition-all", compact ? "h-8" : "h-10")}
      />
    </Link>
  );
}
