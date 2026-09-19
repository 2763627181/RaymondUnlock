"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveBanner } from "@/app/admin/banners/actions";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { SelectField } from "@/components/forms/select-field";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { uploadImage } from "@/lib/admin/upload-image";
import { toast } from "@/lib/toast-store";
import { bannerSchema, type BannerInput, type BannerValues } from "@/lib/validation/admin/content";
import type { Tables } from "@/types/database";

export type BannerRow = Tables<"banners">;

function BannerImageField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (url: string) => void;
  error?: string | undefined;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadImage(file, "banners");
    setUploading(false);
    if (result.ok) onChange(result.url);
    else toast({ title: "No se pudo subir", description: result.message, variant: "destructive" });
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="bg-ink relative aspect-[16/7] overflow-hidden rounded-lg">
          <Image
            src={value}
            alt="Vista previa del banner"
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      ) : null}
      <ImageDropzone
        onFiles={handleFiles}
        disabled={uploading}
        title={uploading ? "Subiendo…" : value ? "Cambiar imagen" : "Subir imagen"}
      />
      <TextField
        id="imageUrl"
        label="URL de la imagen"
        hint=" (se llena al subir)"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
      />
    </div>
  );
}

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
          <BannerImageField
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
