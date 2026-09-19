"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, resendConfirmation } from "@/app/(auth)/actions";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export function LoginForm({ next }: { next: string | undefined }) {
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, getValues, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    setUnconfirmed(false);
    const result = await login({ ...values, next });
    if (!result.ok) {
      setFormError(result.message);
      setUnconfirmed(result.unconfirmed === true);
      return;
    }
    // Recarga completa: la sesión nueva debe leerse desde cero en todo el sitio.
    window.location.assign(result.redirectTo);
  }

  async function resend() {
    const result = await resendConfirmation(getValues("email"));
    if (result.ok) {
      setResent(true);
      toast({
        title: "Revisa tu correo",
        description: "Te enviamos un enlace nuevo.",
        variant: "success",
      });
    } else {
      toast({
        title: "No pudimos reenviarlo",
        description: result.message,
        variant: "destructive",
      });
    }
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
      <div className="text-right">
        <Link href="/recuperar" className="text-brand-blue text-sm hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {formError ? (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      ) : null}
      {unconfirmed ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={resend}
          disabled={resent}
        >
          {resent ? "Enlace enviado" : "Reenviar enlace de confirmación"}
        </Button>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {isSubmitting ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
