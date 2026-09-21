"use client";

import { LayoutGroup, m, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { OptionPills } from "@/components/product/option-pills";
import { UNLOCK_LABELS, formatBattery, isUnlockType } from "@/lib/catalog/text";
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
  const unlocks = variantOptions(variants, "unlock");
  const batteries = variantOptions(variants, "battery");

  function choose(dimension: VariantDimension, value: string) {
    const next = selectOption(variants, selected, dimension, value);
    if (next) onSelect(next);
  }

  const pillTransition = reduceMotion ? { duration: 0 } : springShort;

  return (
    <LayoutGroup id="variant-selector">
      <div className="space-y-6">
        {capacities.length > 0 ? (
          <OptionPills
            groupId="capacity"
            label="Capacidad"
            selectedLabel={selected.capacity}
            options={capacities}
            selectedValue={selected.capacity}
            onChoose={(value) => choose("capacity", value)}
          />
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

        {unlocks.length > 1 ? (
          <OptionPills
            groupId="unlock"
            label="Liberación"
            selectedLabel={selected.unlockType ? UNLOCK_LABELS[selected.unlockType] : null}
            options={unlocks}
            selectedValue={selected.unlockType}
            display={(value) => (isUnlockType(value) ? UNLOCK_LABELS[value] : value)}
            onChoose={(value) => choose("unlock", value)}
          />
        ) : null}

        {batteries.length > 1 ? (
          <OptionPills
            groupId="battery"
            label="Batería"
            selectedLabel={
              selected.batteryHealth === null ? null : formatBattery(selected.batteryHealth)
            }
            options={batteries}
            selectedValue={selected.batteryHealth === null ? null : String(selected.batteryHealth)}
            display={(value) => formatBattery(Number(value))}
            onChoose={(value) => choose("battery", value)}
          />
        ) : null}
      </div>
    </LayoutGroup>
  );
}
