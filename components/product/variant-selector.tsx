"use client";

import { LayoutGroup, m, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { selectOption, variantOptions, type VariantDimension } from "@/lib/catalog/variants";
import { springShort } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CatalogVariant } from "@/types/catalog";

export function VariantSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: CatalogVariant[];
  selected: CatalogVariant;
  onSelect: (variant: CatalogVariant) => void;
}) {
  const reduceMotion = useReducedMotion();
  const capacities = variantOptions(variants, "capacity");
  const colors = variantOptions(variants, "color");

  function choose(dimension: VariantDimension, value: string) {
    const next = selectOption(variants, selected, dimension, value);
    if (next) onSelect(next);
  }

  const pillTransition = reduceMotion ? { duration: 0 } : springShort;

  return (
    <LayoutGroup id="variant-selector">
      <div className="space-y-6">
        {capacities.length > 0 ? (
          <div>
            <p id="grupo-capacidad" className="mb-2.5 text-sm font-medium">
              Capacidad:{" "}
              <span className="text-muted-foreground font-normal">{selected.capacity}</span>
            </p>
            <div
              role="radiogroup"
              aria-labelledby="grupo-capacidad"
              className="flex flex-wrap gap-2"
            >
              {capacities.map((option) => {
                const isSelected = option.value === selected.capacity;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!option.available}
                    title={option.available ? undefined : "Agotado"}
                    onClick={() => choose("capacity", option.value)}
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
                        layoutId="variant-pill-capacity"
                        transition={pillTransition}
                        className="border-ink absolute -inset-px rounded-full border-2"
                      />
                    ) : null}
                    <span className="relative">{option.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {colors.length > 0 ? (
          <div>
            <p id="grupo-color" className="mb-2.5 text-sm font-medium">
              Color: <span className="text-muted-foreground font-normal">{selected.color}</span>
            </p>
            <div role="radiogroup" aria-labelledby="grupo-color" className="flex flex-wrap gap-3">
              {colors.map((option) => {
                const isSelected = option.value === selected.color;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={option.available ? option.value : `${option.value} (agotado)`}
                    disabled={!option.available}
                    title={option.available ? option.value : `${option.value} · Agotado`}
                    onClick={() => choose("color", option.value)}
                    className={cn(
                      "focus-visible:ring-ring relative flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-2",
                      !option.available && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {isSelected ? (
                      <m.span
                        layoutId="variant-pill-color"
                        transition={pillTransition}
                        className="border-ink absolute inset-0 rounded-full border-2"
                      />
                    ) : null}
                    <span
                      className="border-border relative flex size-7 items-center justify-center rounded-full border"
                      style={{ backgroundColor: option.hex ?? "#ffffff" }}
                    >
                      {!option.available ? (
                        <span className="bg-ink absolute h-px w-9 rotate-45" aria-hidden="true" />
                      ) : null}
                      {isSelected && option.available ? (
                        <Check
                          className="size-3.5 text-white mix-blend-difference"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </LayoutGroup>
  );
}
