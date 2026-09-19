"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { register as registerAccount } from "@/app/(auth)/actions";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterInput, type RegisterValues } from "@/lib/validation/auth";

const FIELDS: readonly string[] = [
  "fullName",
  "email",
  "phone",
  "password",
  "businessName",
  "rnc",
  "estimatedVolume",
];

function isField(name: string): name is keyof RegisterInput {
  return FIELDS.includes(name);
}

const TYPES = [
  { value: "customer", label: "Cuenta personal" },
  { value: "wholesale", label: "Negocio (al por mayor)" },
] as const;

export function RegisterForm({
  initialType = "customer",
  lockType = false,
}: {
  initialType?: "customer" | "wholesale";
  /** En /mayorista el formulario es siempre de negocio: no se muestra el selector. */
  lockType?: boolean;
}) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, setError, formState } = useForm<
    RegisterInput,
    unknown,
    RegisterValues
  >({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: initialType,
      fullName: "",
      email: "",
      phone: "",
      password: "",
      businessName: "",
      rnc: "",
      estimatedVolume: "",
      additionalInfo: "",
    },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;
  const accountType = watch("accountType");
  const wholesale = accountType === "wholesale";

  async function onSubmit(values: RegisterValues) {
    const result = await registerAccount(values);
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && isField(field)) setError(field, { message });
      }
      toast({
        title: "No pudimos crear tu cuenta",
        description: result.message,
        variant: "destructive",
      });
      return;
    }
    setSentTo(result.data.email);
  }

  if (sentTo) {
    return (
      <div className="text-center" role="status">
        <span className="bg-surface-2 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold">Revisa tu correo</h2>
        <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
          Si el correo <strong className="text-foreground">{sentTo}</strong> puede registrarse, te
          enviamos un enlace para confirmarlo.
          {wholesale
            ? " Después revisaremos tu solicitud de cuenta al por mayor y te avisaremos."
            : ""}
        </p>
        <Button asChild variant="outline" className="mt-6 h-11">
          <Link href="/login">Ir a iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {lockType ? null : (
        <div
          role="group"
          aria-label="Tipo de cuenta"
          className="bg-surface-2 grid grid-cols-2 gap-1 rounded-xl p-1"
        >
          {TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              aria-pressed={accountType === type.value}
              onClick={() => setValue("accountType", type.value)}
              className={cn(
                "focus-visible:ring-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                accountType === type.value ? "bg-surface shadow-sm" : "text-muted-foreground",
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      )}

      <TextField
        id="fullName"
        label="Nombre completo"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        id="email"
        label="Correo"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        id="phone"
        label="Teléfono"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="809-000-0000"
        error={errors.phone?.message}
        {...register("phone")}
      />

      {wholesale ? (
        <>
          <TextField
            id="businessName"
            label="Nombre del negocio"
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
          <TextField
            id="estimatedVolume"
            label="Volumen estimado"
            hint=" (opcional)"
            placeholder="Ej.: 20 equipos al mes"
            error={errors.estimatedVolume?.message}
            {...register("estimatedVolume")}
          />
        </>
      ) : null}

      <PasswordField
        id="password"
        label="Contraseña"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <p className="text-muted-foreground -mt-3 text-[13px]">Mínimo 8 caracteres.</p>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
        {...register("additionalInfo")}
      />

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {isSubmitting
          ? "Creando cuenta…"
          : wholesale
            ? "Solicitar cuenta al por mayor"
            : "Crear mi cuenta"}
      </Button>
    </form>
  );
}
