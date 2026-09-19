"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveBrand } from "@/app/admin/marcas/actions";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { useAutoSlug } from "@/lib/admin/use-auto-slug";
import { brandSchema, type BrandInput, type BrandValues } from "@/lib/validation/admin/taxonomy";
import type { Tables } from "@/types/database";

export type BrandRow = Tables<"brands">;

export function BrandForm({ brand, onDone }: { brand?: BrandRow; onDone: () => void }) {
  const router = useRouter();
  const form = useForm<BrandInput, unknown, BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { id: brand?.id, name: brand?.name ?? "", slug: brand?.slug ?? "" },
    mode: "onTouched",
  });
  const { register, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting } = formState;
  useAutoSlug(form, { name: "name", slug: "slug" }, !brand);

  async function onSubmit(values: BrandValues) {
    const result = await runAction(saveBrand(values), "Marca guardada");
    if (!result.ok) {
      const message = result.fieldErrors?.slug?.[0];
      if (message) setError("slug", { message });
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
