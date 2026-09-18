"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/format";

const STEP = 100;

export function PriceFilter({
  bounds,
  priceMin,
  priceMax,
  onCommit,
}: {
  bounds: { min: number; max: number };
  priceMin: number | null;
  priceMax: number | null;
  onCommit: (range: { priceMin: number | null; priceMax: number | null }) => void;
}) {
  const [range, setRange] = useState<[number, number]>([
    Math.max(bounds.min, priceMin ?? bounds.min),
    Math.min(bounds.max, priceMax ?? bounds.max),
  ]);

  if (bounds.min >= bounds.max) return null;

  return (
    <div className="px-1">
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={STEP}
        minStepsBetweenThumbs={1}
        value={range}
        thumbLabels={["Precio mínimo", "Precio máximo"]}
        onValueChange={(value) => {
          const [low, high] = value;
          if (low !== undefined && high !== undefined) setRange([low, high]);
        }}
        onValueCommit={(value) => {
          const [low, high] = value;
          if (low === undefined || high === undefined) return;
          onCommit({
            priceMin: low <= bounds.min ? null : low,
            priceMax: high >= bounds.max ? null : high,
          });
        }}
      />
      <div className="tabular-nums-price text-muted-foreground mt-3 flex justify-between text-xs">
        <span>{formatPrice(range[0])}</span>
        <span>{formatPrice(range[1])}</span>
      </div>
    </div>
  );
}
