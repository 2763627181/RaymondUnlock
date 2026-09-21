"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveWholesaleContact } from "@/app/admin/proveedores/actions";
import { SwitchField } from "@/components/forms/switch-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import {
  wholesaleContactSchema,
  type WholesaleContactInput,
  type WholesaleContactValues,
} from "@/lib/validation/admin/wholesale";
import type { Tables } from "@/types/database";

export type WholesaleContactRow = Tables<"wholesale_contacts">;

export function WholesaleContactForm({
  contact,
  onDone,
}: {
  contact?: WholesaleContactRow;
  onDone: () => void;
}) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState } = useForm<
    WholesaleContactInput,
    unknown,
    WholesaleContactValues
  >({
    resolver: zodResolver(wholesaleContactSchema),
    defaultValues: {
      id: contact?.id,
      label: contact?.label ?? "",
      personName: contact?.person_name ?? "",
      whatsapp: contact?.whatsapp ?? "",
      isActive: contact?.is_active ?? true,
    },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: WholesaleContactValues) {
    const result = await runAction(saveWholesaleContact(values), "Contacto guardado");
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && field in wholesaleContactSchema.shape) {
          setError(field as keyof WholesaleContactInput, { message });
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
        id="label"
        label="Nombre en la lista"
        placeholder="Ventas 1"
        error={errors.label?.message}
        {...register("label")}
      />
      <TextField
        id="personName"
        label="Persona"
        hint=" (opcional)"
        placeholder="Ashley"
        error={errors.personName?.message}
        {...register("personName")}
      />
      <TextField
        id="whatsapp"
        label="WhatsApp"
        hint=" (con el código de área)"
        placeholder="809-712-3062"
        inputMode="tel"
        error={errors.whatsapp?.message}
        {...register("whatsapp")}
      />
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <SwitchField
            id="isActive"
            label="Recibe pedidos"
            description="Si lo apagas, deja de aparecer en “Enviar pedido a”."
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
