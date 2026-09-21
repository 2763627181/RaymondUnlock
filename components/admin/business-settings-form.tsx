"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { saveSetting } from "@/app/admin/ajustes/actions";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { businessSchema } from "@/lib/validation/settings";

type BusinessInput = z.input<typeof businessSchema>;
type BusinessValues = z.output<typeof businessSchema>;

export function BusinessSettingsForm({ initial }: { initial: BusinessValues }) {
  const router = useRouter();
  const { register, handleSubmit, reset, formState } = useForm<
    BusinessInput,
    unknown,
    BusinessValues
  >({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      ...initial,
      facebookUrl: initial.facebookUrl ?? "",
      localPhone: initial.localPhone ?? "",
    },
    mode: "onTouched",
  });
  const { errors, isSubmitting, isDirty } = formState;

  async function onSubmit(values: BusinessValues) {
    const result = await runAction(saveSetting("business", values), "Datos del negocio guardados");
    if (result.ok) {
      // Lo guardado pasa a ser la nueva base: "sin cambios" se mide contra eso.
      reset({
        ...values,
        facebookUrl: values.facebookUrl ?? "",
        localPhone: values.localPhone ?? "",
      });
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="businessName"
          label="Nombre del negocio"
          error={errors.businessName?.message}
          {...register("businessName")}
        />
        <TextField
          id="tagline"
          label="Eslogan"
          error={errors.tagline?.message}
          {...register("tagline")}
        />
      </div>
      <TextareaField
        id="description"
        label="Descripción del negocio"
        hint=" (se usa en buscadores)"
        error={errors.description?.message}
        {...register("description")}
      />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="phoneDisplay"
            label="Celular (como se muestra)"
            error={errors.phoneDisplay?.message}
            {...register("phoneDisplay")}
          />
          <TextField
            id="whatsappNumber"
            label="WhatsApp (con código de país)"
            hint=" (solo dígitos)"
            inputMode="numeric"
            placeholder="18099063114"
            error={errors.whatsappNumber?.message}
            {...register("whatsappNumber")}
          />
          <TextField
            id="localPhone"
            label="Teléfono del local"
            hint=" (opcional)"
            inputMode="tel"
            placeholder="829-688-3114"
            error={errors.localPhone?.message}
            {...register("localPhone")}
          />
        </div>
        <TextField
          id="email"
          label="Correo"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Dirección</legend>
        <TextField
          id="address"
          label="Dirección completa"
          error={errors.address?.message}
          {...register("address")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="street"
            label="Calle y número"
            error={errors.addressParts?.street?.message}
            {...register("addressParts.street")}
          />
          <TextField
            id="locality"
            label="Ciudad"
            error={errors.addressParts?.locality?.message}
            {...register("addressParts.locality")}
          />
          <TextField
            id="postalCode"
            label="Código postal"
            error={errors.addressParts?.postalCode?.message}
            {...register("addressParts.postalCode")}
          />
          <TextField
            id="country"
            label="País"
            hint=" (2 letras)"
            error={errors.addressParts?.country?.message}
            {...register("addressParts.country")}
          />
        </div>
      </fieldset>

      <TextareaField
        id="shippingNote"
        label="Nota de envíos"
        error={errors.shippingNote?.message}
        {...register("shippingNote")}
      />

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Redes sociales</legend>
        <TextField
          id="instagramUrl"
          label="Instagram"
          error={errors.instagramUrl?.message}
          {...register("instagramUrl")}
        />
        <TextField
          id="threadsUrl"
          label="Threads"
          error={errors.threadsUrl?.message}
          {...register("threadsUrl")}
        />
        <TextField
          id="facebookUrl"
          label="Facebook"
          hint=" (opcional; vacío = no se muestra)"
          placeholder="https://www.facebook.com/…"
          error={errors.facebookUrl?.message}
          {...register("facebookUrl")}
        />
      </fieldset>

      <p className="text-muted-foreground text-[13px]">
        Moneda: pesos dominicanos (DOP, RD$). Es fija en todo el sitio.
      </p>

      <Button type="submit" className="h-11 px-6" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "Guardando…" : "Guardar datos del negocio"}
      </Button>
    </form>
  );
}
