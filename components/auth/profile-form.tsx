"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/app/(auth)/actions";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { profileSchema, type ProfileInput, type ProfileValues } from "@/lib/validation/auth";

const FIELDS: readonly string[] = ["fullName", "phone", "businessName", "rnc"];

function isField(name: string): name is keyof ProfileInput {
  return FIELDS.includes(name);
}

export function ProfileForm({ defaults }: { defaults: ProfileInput }) {
  const router = useRouter();
  const { register, handleSubmit, reset, setError, formState } = useForm<
    ProfileInput,
    unknown,
    ProfileValues
  >({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const { errors, isSubmitting, isDirty } = formState;

  async function onSubmit(values: ProfileValues) {
    const result = await updateProfile(values);
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && isField(field)) setError(field, { message });
      }
      toast({ title: "No pudimos guardar", description: result.message, variant: "destructive" });
      return;
    }
    toast({ title: "Datos guardados", variant: "success" });
    reset({
      fullName: values.fullName,
      phone: values.phone,
      businessName: values.businessName ?? "",
      rnc: values.rnc ?? "",
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField
        id="fullName"
        label="Nombre completo"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        id="phone"
        label="Teléfono"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <TextField
        id="businessName"
        label="Nombre del negocio"
        hint=" (opcional)"
        autoComplete="organization"
        error={errors.businessName?.message}
        {...register("businessName")}
      />
      <TextField
        id="rnc"
        label="RNC"
        hint=" (opcional)"
        inputMode="numeric"
        error={errors.rnc?.message}
        {...register("rnc")}
      />
      <Button type="submit" disabled={isSubmitting || !isDirty} className="h-11 px-6">
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
