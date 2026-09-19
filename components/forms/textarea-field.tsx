import type { ComponentProps } from "react";
import { FieldError } from "@/components/forms/field-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps extends ComponentProps<"textarea"> {
  id: string;
  label: string;
  hint?: string;
  error?: string | undefined;
}

export function TextareaField({ id, label, hint, error, ...props }: TextareaFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {hint ? <span className="text-muted-foreground font-normal">{hint}</span> : null}
      </Label>
      <Textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5"
        {...props}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
