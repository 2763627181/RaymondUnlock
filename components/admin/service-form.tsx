"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveService } from "@/app/admin/servicios/actions";
import { SelectField } from "@/components/forms/select-field";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { useAutoSlug } from "@/lib/admin/use-auto-slug";
import { ICON_NAMES } from "@/lib/icons";
import {
  serviceSchema,
  type ServiceInput,
  type ServiceValues,
} from "@/lib/validation/admin/content";
import type { Tables } from "@/types/database";

export type ServiceRow = Tables<"services">;

export function ServiceForm({ service, onDone }: { service?: ServiceRow; onDone: () => void }) {
  const router = useRouter();
  const form = useForm<ServiceInput, unknown, ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      id: service?.id,
      name: service?.name ?? "",
      slug: service?.slug ?? "",
      description: service?.description ?? "",
      icon: service?.icon ?? "",
      priceFrom: service?.price_from?.toString() ?? "",
      turnaround: service?.turnaround ?? "",
      deviceTypes: service?.device_types.join(", ") ?? "",
      isActive: service?.is_active ?? true,
    },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, formState } = form;
  const { errors, isSubmitting } = formState;
  useAutoSlug(form, { name: "name", slug: "slug" }, !service);

  async function onSubmit(values: ServiceValues) {
    const result = await runAction(saveService(values), "Servicio guardado");
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && field in serviceSchema.shape) {
          setError(field as keyof ServiceInput, { message });
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
        <TextField
          id="priceFrom"
          label="Precio desde (RD$)"
          hint=" (opcional)"
          inputMode="decimal"
          error={errors.priceFrom?.message}
          {...register("priceFrom")}
        />
        <TextField
          id="turnaround"
          label="Tiempo estimado"
          hint=" (opcional)"
          placeholder="Mismo día"
          error={errors.turnaround?.message}
          {...register("turnaround")}
        />
      </div>
      <TextField
        id="deviceTypes"
        label="Equipos"
        hint=" (separados por comas)"
        placeholder="iPhone, Samsung, Xiaomi"
        error={errors.deviceTypes?.message}
        {...register("deviceTypes")}
      />
      <SelectField id="icon" label="Icono" error={errors.icon?.message} {...register("icon")}>
        <option value="">Sin icono</option>
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </SelectField>
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <SwitchField
            id="isActive"
            label="Visible en la tienda"
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
