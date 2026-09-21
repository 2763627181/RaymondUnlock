"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveBanner } from "@/app/admin/banners/actions";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { SelectField } from "@/components/forms/select-field";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { bannerSchema, type BannerInput, type BannerValues } from "@/lib/validation/admin/content";
import type { Tables } from "@/types/database";

export type BannerRow = Tables<"banners">;

export function BannerForm({ banner, onDone }: { banner?: BannerRow; onDone: () => void }) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState } = useForm<
    BannerInput,
    unknown,
    BannerValues
  >({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      id: banner?.id,
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      imageUrl: banner?.image_url ?? "",
      ctaLabel: banner?.cta_label ?? "",
      ctaHref: banner?.cta_href ?? "",
      theme: banner?.theme === "light" ? "light" : "dark",
      isActive: banner?.is_active ?? true,
    },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: BannerValues) {
    const result = await runAction(saveBanner(values), "Banner guardado");
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && field in bannerSchema.shape) {
          setError(field as keyof BannerInput, { message });
        }
      }
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
      <TextField id="title" label="Título" error={errors.title?.message} {...register("title")} />
      <TextField
        id="subtitle"
        label="Subtítulo"
        hint=" (opcional)"
        error={errors.subtitle?.message}
        {...register("subtitle")}
      />
      <Controller
        control={control}
        name="imageUrl"
        render={({ field }) => (
          <ImageUrlField
            folder="banners"
            value={field.value}
            onChange={field.onChange}
            error={errors.imageUrl?.message}
          />
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="ctaLabel"
          label="Texto del botón"
          hint=" (opcional)"
          placeholder="Comprar ahora"
          error={errors.ctaLabel?.message}
          {...register("ctaLabel")}
        />
        <TextField
          id="ctaHref"
          label="Enlace del botón"
          hint=" (opcional)"
          placeholder="/producto/iphone-15-pro"
          error={errors.ctaHref?.message}
          {...register("ctaHref")}
        />
      </div>
      <SelectField id="theme" label="Tema" error={errors.theme?.message} {...register("theme")}>
        <option value="dark">Oscuro (texto claro)</option>
        <option value="light">Claro (texto oscuro)</option>
      </SelectField>
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <SwitchField
            id="isActive"
            label="Visible en la portada"
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
