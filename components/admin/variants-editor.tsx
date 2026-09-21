"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Copy, Plus, Trash2 } from "lucide-react";
import { SelectField } from "@/components/forms/select-field";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMPTY_VARIANT_INPUT } from "@/lib/admin/product-form-defaults";
import { UNLOCK_LABELS } from "@/lib/catalog/text";
import type { ProductInput, VariantInput } from "@/lib/validation/admin/product";
import { Constants } from "@/types/database";

const HEX = /^#[0-9A-Fa-f]{6}$/;

/** Color de la variante: selector nativo + campo #RRGGBB (vacío = sin color). */
function ColorField({
  index,
  value,
  onChange,
  error,
}: {
  index: number;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  const id = `variants-${index}-colorHex`;
  return (
    <div>
      <Label htmlFor={id}>
        Color <span className="text-muted-foreground font-normal">(#RRGGBB)</span>
      </Label>
      <div className="mt-1.5 flex gap-2">
        <input
          type="color"
          aria-label={`Elegir color de la variante ${index + 1}`}
          value={HEX.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="border-input h-11 w-11 shrink-0 cursor-pointer rounded-lg border bg-transparent p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#B7AFA3"
          aria-invalid={error ? true : undefined}
          className="h-11"
        />
      </div>
      {error ? (
        <p role="alert" className="text-destructive mt-1.5 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function VariantsEditor() {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<ProductInput>();
  // El campo `id` de la variante es el de la base de datos: la clave interna de RHF debe ser otra.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
    keyName: "fieldKey",
  });

  function duplicate(index: number) {
    const source = getValues(`variants.${index}`);
    append({ ...source, id: undefined, sku: "" });
  }

  const rootError = errors.variants?.root?.message ?? errors.variants?.message;

  return (
    <section aria-labelledby="variantes-titulo" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="variantes-titulo" className="text-lg font-semibold">
            Variantes y precios
          </h2>
          <p className="text-muted-foreground text-[13px]">
            Cada equipo o combinación de capacidad y color, con su batería, liberación (factory o
            por artista), precios y stock.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => append(EMPTY_VARIANT_INPUT)}
        >
          <Plus /> Agregar variante
        </Button>
      </div>
      {rootError ? (
        <p role="alert" className="text-destructive text-sm">
          {rootError}
        </p>
      ) : null}

      <ul className="space-y-4">
        {fields.map((field, index) => {
          const variantErrors = errors.variants?.[index];
          const name = <K extends keyof VariantInput>(key: K) =>
            `variants.${index}.${key}` as const;
          return (
            <li
              key={field.fieldKey}
              className="border-border bg-surface space-y-4 rounded-xl border p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Variante {index + 1}</p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Duplicar variante ${index + 1}`}
                    onClick={() => duplicate(index)}
                  >
                    <Copy />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Quitar variante ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField
                  id={`variants-${index}-capacity`}
                  label="Capacidad"
                  hint=" (ej. 128 GB)"
                  error={variantErrors?.capacity?.message}
                  {...register(name("capacity"))}
                />
                <TextField
                  id={`variants-${index}-color`}
                  label="Color"
                  hint=" (nombre)"
                  error={variantErrors?.color?.message}
                  {...register(name("color"))}
                />
                <Controller
                  control={control}
                  name={name("colorHex")}
                  render={({ field: hexField }) => (
                    <ColorField
                      index={index}
                      value={hexField.value ?? ""}
                      onChange={hexField.onChange}
                      error={variantErrors?.colorHex?.message}
                    />
                  )}
                />
                <TextField
                  id={`variants-${index}-sku`}
                  label="Código (SKU)"
                  hint=" (vacío = automático)"
                  error={variantErrors?.sku?.message}
                  {...register(name("sku"))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField
                  id={`variants-${index}-batteryHealth`}
                  label="Batería"
                  hint=" (%, equipos usados)"
                  inputMode="numeric"
                  error={variantErrors?.batteryHealth?.message}
                  {...register(name("batteryHealth"))}
                />
                <SelectField
                  id={`variants-${index}-unlockType`}
                  label="Liberación"
                  error={variantErrors?.unlockType?.message}
                  {...register(name("unlockType"))}
                >
                  <option value="">No aplica</option>
                  {Constants.public.Enums.unlock_type.map((type) => (
                    <option key={type} value={type}>
                      {UNLOCK_LABELS[type]}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <TextField
                  id={`variants-${index}-priceRetail`}
                  label="Precio unidad (RD$)"
                  inputMode="decimal"
                  error={variantErrors?.priceRetail?.message}
                  {...register(name("priceRetail"))}
                />
                <TextField
                  id={`variants-${index}-priceWholesale`}
                  label="Precio por mayor"
                  hint=" (RD$)"
                  inputMode="decimal"
                  error={variantErrors?.priceWholesale?.message}
                  {...register(name("priceWholesale"))}
                />
                <TextField
                  id={`variants-${index}-minWholesaleQty`}
                  label="Mín. mayorista"
                  hint=" (uds.)"
                  inputMode="numeric"
                  error={variantErrors?.minWholesaleQty?.message}
                  {...register(name("minWholesaleQty"))}
                />
                <TextField
                  id={`variants-${index}-compareAtPrice`}
                  label="Precio tachado"
                  hint=" (opcional)"
                  inputMode="decimal"
                  error={variantErrors?.compareAtPrice?.message}
                  {...register(name("compareAtPrice"))}
                />
                <TextField
                  id={`variants-${index}-stock`}
                  label="Stock"
                  inputMode="numeric"
                  error={variantErrors?.stock?.message}
                  {...register(name("stock"))}
                />
              </div>

              <Controller
                control={control}
                name={name("isActive")}
                render={({ field: activeField }) => (
                  <SwitchField
                    id={`variants-${index}-isActive`}
                    label="Variante activa"
                    description="Si la desactivas deja de mostrarse y de poder cotizarse."
                    checked={activeField.value}
                    onCheckedChange={activeField.onChange}
                  />
                )}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
