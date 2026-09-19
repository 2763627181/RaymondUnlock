"use client";

import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveProduct } from "@/app/admin/productos/actions";
import { SpecsEditor } from "@/components/admin/specs-editor";
import { VariantsEditor } from "@/components/admin/variants-editor";
import { SelectField } from "@/components/forms/select-field";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { useAutoSlug } from "@/lib/admin/use-auto-slug";
import { CONDITION_LABELS } from "@/lib/catalog/text";
import {
  productSchema,
  type ProductInput,
  type ProductValues,
} from "@/lib/validation/admin/product";
import { Constants } from "@/types/database";

export interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
}

export interface BrandOption {
  id: string;
  name: string;
}

function CategoryOptions({ categories }: { categories: CategoryOption[] }) {
  const parents = categories.filter((category) => category.parentId === null);
  return (
    <>
      <option value="">Elige una categoría</option>
      {parents.map((parent) => {
        const children = categories.filter((category) => category.parentId === parent.id);
        return children.length === 0 ? (
          <option key={parent.id} value={parent.id}>
            {parent.name}
          </option>
        ) : (
          <optgroup key={parent.id} label={parent.name}>
            <option value={parent.id}>{parent.name} (general)</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
}

export function ProductForm({
  defaults,
  categories,
  brands,
}: {
  defaults: ProductInput;
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const isNew = defaults.id === undefined;
  const form = useForm<ProductInput, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting, isDirty } = formState;
  useAutoSlug(form, { name: "name", slug: "slug" }, isNew);

  async function onSubmit(values: ProductValues) {
    const result = await runAction(
      saveProduct(values),
      isNew ? "Producto creado" : "Cambios guardados",
    );
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && field in productSchema.shape) {
          setError(field as keyof ProductInput, { message });
        }
      }
      return;
    }
    if (isNew) router.push(`/admin/productos/${result.data.id}?nuevo=1`);
    else router.refresh();
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Datos generales</h2>
            <TextField
              id="name"
              label="Nombre"
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              id="slug"
              label="Slug (parte de la URL)"
              error={errors.slug?.message}
              {...register("slug")}
            />
            <SelectField
              id="categoryId"
              label="Categoría"
              error={errors.categoryId?.message}
              {...register("categoryId")}
            >
              <CategoryOptions categories={categories} />
            </SelectField>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <SelectField
                id="brandId"
                label="Marca"
                error={errors.brandId?.message}
                {...register("brandId")}
              >
                <option value="">Sin marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="condition"
                label="Condición"
                error={errors.condition?.message}
                {...register("condition")}
              >
                {Constants.public.Enums.product_condition.map((condition) => (
                  <option key={condition} value={condition}>
                    {CONDITION_LABELS[condition]}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextareaField
              id="shortDescription"
              label="Descripción corta"
              hint=" (opcional)"
              rows={2}
              error={errors.shortDescription?.message}
              {...register("shortDescription")}
            />
            <TextareaField
              id="description"
              label="Descripción"
              hint=" (párrafos, listas con “- ” y **negrita**)"
              rows={6}
              error={errors.description?.message}
              {...register("description")}
            />
            <TextareaField
              id="warrantyNote"
              label="Garantía"
              hint=" (opcional)"
              rows={2}
              error={errors.warrantyNote?.message}
              {...register("warrantyNote")}
            />
            <SpecsEditor />
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <SwitchField
                  id="isFeatured"
                  label="Destacado"
                  description="Aparece en “Más vendidos” de la portada."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <SwitchField
                  id="isActive"
                  label="Publicado"
                  description="Si está apagado, no se ve en la tienda."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <VariantsEditor />
        </div>

        <div className="bg-surface/95 border-border sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-end gap-3 border-t px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
          {isDirty ? (
            <p className="text-muted-foreground mr-auto text-sm">Tienes cambios sin guardar.</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => router.push("/admin/productos")}
          >
            Volver
          </Button>
          <Button type="submit" className="h-11 px-6" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
