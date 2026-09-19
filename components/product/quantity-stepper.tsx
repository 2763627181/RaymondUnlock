"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_LINE_QUANTITY } from "@/lib/cart/constants";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  label = "Cantidad",
  size = "md",
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: "sm" | "md";
}) {
  const buttonClass = cn(
    "hover:bg-surface-2 focus-visible:ring-ring flex items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 disabled:opacity-40",
    size === "sm" ? "size-8" : "size-10",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className="border-border inline-flex items-center rounded-full border p-0.5"
    >
      <button
        type="button"
        aria-label="Disminuir cantidad"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={buttonClass}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span
        className={cn(
          "tabular-nums-price text-center text-sm font-medium",
          size === "sm" ? "min-w-8" : "min-w-10",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={value >= MAX_LINE_QUANTITY}
        onClick={() => onChange(value + 1)}
        className={buttonClass}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
