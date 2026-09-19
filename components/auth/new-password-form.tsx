"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePassword } from "@/app/(auth)/actions";
import { PasswordField } from "@/components/forms/password-field";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { newPasswordSchema, type NewPasswordInput } from "@/lib/validation/auth";

export function NewPasswordForm() {
  const { register, handleSubmit, formState } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: NewPasswordInput) {
    const result = await updatePassword(values);
    if (!result.ok) {
      toast({ title: "No pudimos cambiarla", description: result.message, variant: "destructive" });
      return;
    }
    // Recarga completa: la sesión que abrió el enlace debe leerse desde cero en todo el sitio.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/cuenta");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <PasswordField
        id="password"
        label="Contraseña nueva"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        id="confirm"
        label="Repite la contraseña"
        autoComplete="new-password"
        error={errors.confirm?.message}
        {...register("confirm")}
      />
      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {isSubmitting ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
