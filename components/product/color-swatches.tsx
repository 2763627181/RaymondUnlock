import type { CardColor } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function ColorSwatches({ colors, className }: { colors: CardColor[]; className?: string }) {
  if (colors.length === 0) return null;
  return (
    <ul className={cn("flex items-center gap-1.5", className)} aria-label="Colores disponibles">
      {colors.map((color) => (
        <li key={color.hex}>
          <span
            title={color.name}
            className="border-border block size-3.5 rounded-full border"
            style={{ backgroundColor: color.hex }}
          >
            <span className="sr-only">{color.name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
