"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveWholesaleProduct } from "@/app/admin/proveedores/actions";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import {
  wholesaleProductSchema,
  type WholesaleProductInput,
  type WholesaleProductValues,
} from "@/lib/validation/admin/wholesale";
import type { Tables } from "@/types/database";

export type WholesaleProductRow = Tables<"wholesale_products">;

/** Lo que ya está escrito en el listado, para sugerirlo al escribir y no repetir con otra ortografía. */
export interface WholesaleSuggestions {
  types: string[];
  categories: string[];
  conditions: string[];
}

function Suggestions({ id, values }: { id: string; values: string[] }) {
  return (
    <datalist id={id}>
      {values.map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}

export function WholesaleProductForm({
  product,
  suggestions,
  onDone,
}: {
  product?: WholesaleProductRow;
  suggestions: WholesaleSuggestions;
  onDone: () => void;
}) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState } = useForm<
    WholesaleProductInput,
    unknown,
    WholesaleProductValues
  >({
    resolver: zodResolver(wholesaleProductSchema),
    defaultValues: {
      id: product?.id,
      name: product?.name ?? "",
      type: product?.product_type ?? "",
      category: product?.category ?? "",
      condition: product?.condition ?? "",
      price: product ? String(product.price) : "",
      imageUrl: product?.image_url ?? "",
      isActive: product?.is_active ?? true,
    },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: WholesaleProductValues) {
    const result = await runAction(saveWholesaleProduct(values), "Producto guardado");
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && field in wholesaleProductSchema.shape) {
          setError(field as keyof WholesaleProductInput, { message });
        }
      }
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
      <TextField
        id="name"
        label="Nombre"
        placeholder="M-Horse S26 Ultra Max 4G 4Gb/64Gb"
        error={errors.name?.message}
        {...register("name")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="type"
          label="Tipo de producto"
          placeholder="Celulares"
          list="wholesale-types"
          error={errors.type?.message}
          {...register("type")}
        />
        <TextField
          id="category"
          label="Categoría"
          placeholder="M-HORSE"
          list="wholesale-categories"
          error={errors.category?.message}
          {...register("category")}
        />
        <TextField
          id="condition"
          label="Condición"
          placeholder="NUEVO"
          list="wholesale-conditions"
          error={errors.condition?.message}
          {...register("condition")}
        />
        <TextField
          id="price"
          label="Precio al por mayor"
          hint=" (RD$)"
          inputMode="decimal"
          error={errors.price?.message}
          {...register("price")}
        />
      </div>
      <Suggestions id="wholesale-types" values={suggestions.types} />
      <Suggestions id="wholesale-categories" values={suggestions.categories} />
      <Suggestions id="wholesale-conditions" values={suggestions.conditions} />

      <Controller
        control={control}
        name="imageUrl"
        render={({ field }) => (
          <ImageUrlField
            folder="wholesale"
            optional
            previewClassName="aspect-square w-32 bg-surface-2"
            value={field.value ?? ""}
            onChange={field.onChange}
            error={errors.imageUrl?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <SwitchField
            id="isActive"
            label="Visible en el listado"
            description="Si lo apagas, deja de mostrarse y de poder pedirse."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="h-10" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" className="h-10 px-5" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
