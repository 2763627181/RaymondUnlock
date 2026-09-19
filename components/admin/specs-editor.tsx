"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import type { ProductInput } from "@/lib/validation/admin/product";

/** Ficha técnica: pares nombre/valor (Pantalla, Chip, Cámara…). */
export function SpecsEditor() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProductInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "specs" });

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Especificaciones</legend>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-[1fr_1.4fr_auto] items-start gap-2">
          <TextField
            id={`specs-${index}-key`}
            label="Nombre"
            placeholder="Pantalla"
            error={errors.specs?.[index]?.key?.message}
            {...register(`specs.${index}.key`)}
          />
          <TextField
            id={`specs-${index}-value`}
            label="Valor"
            placeholder='6.1" OLED'
            error={errors.specs?.[index]?.value?.message}
            {...register(`specs.${index}.value`)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6"
            aria-label={`Quitar especificación ${index + 1}`}
            onClick={() => remove(index)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="h-9"
        onClick={() => append({ key: "", value: "" })}
      >
        <Plus /> Agregar especificación
      </Button>
    </fieldset>
  );
}
