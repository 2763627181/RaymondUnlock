"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import { recoverSchema, type RecoverInput } from "@/lib/validation/auth";

export function RecoverForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "", additionalInfo: "" },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: RecoverInput) {
    const result = await requestPasswordReset(values);
    if (!result.ok) {
      toast({ title: "No pudimos enviarlo", description: result.message, variant: "destructive" });
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center" role="status">
        <span className="bg-surface-2 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          Si ese correo tiene una cuenta, te enviamos un enlace para elegir una contraseña nueva.
        </p>
      </div>
    );
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
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
        {...register("additionalInfo")}
      />
      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {isSubmitting ? "Enviando…" : "Enviar enlace"}
      </Button>
    </form>
  );
}
