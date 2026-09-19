import type { ComponentProps } from "react";
import { FieldError } from "@/components/forms/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextFieldProps extends ComponentProps<"input"> {
  id: string;
  label: string;
  /** Texto gris junto a la etiqueta, p. ej. "opcional". */
  hint?: string;
  error?: string | undefined;
}

/** Etiqueta + input + mensaje de error, ya enlazados para lectores de pantalla. */
export function TextField({ id, label, hint, error, className, ...props }: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {hint ? <span className="text-muted-foreground font-normal">{hint}</span> : null}
      </Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("mt-1.5 h-11", className)}
        {...props}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
