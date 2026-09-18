"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_LINE_QUANTITY } from "@/lib/cart/store";

export function QuantityStepper({
  value,
  onChange,
  label = "Cantidad",
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  const buttonClass =
    "hover:bg-surface-2 focus-visible:ring-ring flex size-10 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 disabled:opacity-40";

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
        className="tabular-nums-price min-w-10 text-center text-sm font-medium"
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
