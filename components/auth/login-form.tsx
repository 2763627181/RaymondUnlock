"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/app/(auth)/actions";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export function LoginForm({ next }: { next: string | undefined }) {
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await login({ ...values, next });
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    // Recarga completa: la sesión nueva debe leerse desde cero en todo el sitio.
    window.location.assign(result.redirectTo);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField
        id="email"
        label="Correo"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        id="password"
        label="Contraseña"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {formError ? (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {isSubmitting ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
