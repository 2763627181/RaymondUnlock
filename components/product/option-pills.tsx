"use client";

import { m, useReducedMotion } from "motion/react";
import type { VariantOption } from "@/lib/catalog/variants";
import { springShort } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Grupo de opciones en forma de píldora (capacidad, liberación, batería). */
export function OptionPills({
  groupId,
  label,
  selectedLabel,
  options,
  selectedValue,
  display = (value) => value,
  onChoose,
}: {
  groupId: string;
  label: string;
  /** Texto de la opción elegida, junto al título. */
  selectedLabel: string | null;
  options: VariantOption[];
  selectedValue: string | null;
  /** Cómo se escribe cada valor ("92" → "92 %"). */
  display?: (value: string) => string;
  onChoose: (value: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion ? { duration: 0 } : springShort;

  return (
    <div>
      <p id={`grupo-${groupId}`} className="mb-2.5 text-sm font-medium">
        {label}: <span className="text-muted-foreground font-normal">{selectedLabel}</span>
      </p>
      <div role="radiogroup" aria-labelledby={`grupo-${groupId}`} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!option.available}
              title={option.available ? undefined : "Agotado"}
              onClick={() => onChoose(option.value)}
              className={cn(
                "focus-visible:ring-ring relative min-w-16 rounded-full px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2",
                "border-border border transition-colors",
                option.available
                  ? "hover:bg-surface-2"
                  : "text-muted-foreground cursor-not-allowed line-through opacity-50",
              )}
            >
              {isSelected ? (
                <m.span
                  layoutId={`variant-pill-${groupId}`}
                  transition={pillTransition}
                  className="border-ink absolute -inset-px rounded-full border-2"
                />
              ) : null}
              <span className="relative">{display(option.value)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
