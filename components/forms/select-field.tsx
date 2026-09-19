import type { ComponentProps } from "react";
import { FieldError } from "@/components/forms/field-error";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

interface SelectFieldProps extends ComponentProps<"select"> {
  id: string;
  label: string;
  hint?: string;
  error?: string | undefined;
}

export function SelectField({ id, label, hint, error, children, ...props }: SelectFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {hint ? <span className="text-muted-foreground font-normal">{hint}</span> : null}
      </Label>
      <NativeSelect
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5"
        {...props}
      >
        {children}
      </NativeSelect>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
