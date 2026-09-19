"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveCategory } from "@/app/admin/categorias/actions";
import { SelectField } from "@/components/forms/select-field";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { useAutoSlug } from "@/lib/admin/use-auto-slug";
import { ICON_NAMES } from "@/lib/icons";
import {
  categorySchema,
  type CategoryInput,
  type CategoryValues,
} from "@/lib/validation/admin/taxonomy";
import type { Tables } from "@/types/database";

export type CategoryRow = Tables<"categories">;

export function CategoryForm({
  category,
  parents,
  onDone,
}: {
  category?: CategoryRow;
  /** Categorías de primer nivel elegibles como padre (sin la propia). */
  parents: CategoryRow[];
  onDone: () => void;
}) {
  const router = useRouter();
  const form = useForm<CategoryInput, unknown, CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category?.id,
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      icon: category?.icon ?? "",
      parentId: category?.parent_id ?? "",
      isActive: category?.is_active ?? true,
    },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting } = formState;
  useAutoSlug(form, { name: "name", slug: "slug" }, !category);

  async function onSubmit(values: CategoryValues) {
    const result = await runAction(saveCategory(values), "Categoría guardada");
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && field in categorySchema.shape) {
          setError(field as keyof CategoryInput, { message });
        }
      }
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
      <TextField id="name" label="Nombre" error={errors.name?.message} {...register("name")} />
      <TextField
        id="slug"
        label="Slug (parte de la URL)"
        error={errors.slug?.message}
        {...register("slug")}
      />
      <TextareaField
        id="description"
        label="Descripción"
        hint=" (opcional)"
        error={errors.description?.message}
        {...register("description")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField id="icon" label="Icono" error={errors.icon?.message} {...register("icon")}>
          <option value="">Sin icono</option>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="parentId"
          label="Categoría padre"
          error={errors.parentId?.message}
          {...register("parentId")}
        >
          <option value="">Ninguna (nivel principal)</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </SelectField>
      </div>
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <SwitchField
            id="isActive"
            label="Visible en la tienda"
            description="Si la ocultas, sus productos dejan de mostrarse."
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
