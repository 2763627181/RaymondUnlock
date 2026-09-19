"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Interruptor con etiqueta clicable, para usar con `Controller` de react-hook-form. */
export function SwitchField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        {description ? (
          <span className="text-muted-foreground mt-0.5 block text-[13px]">{description}</span>
        ) : null}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
