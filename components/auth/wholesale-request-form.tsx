"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestWholesaleAccess } from "@/app/(auth)/actions";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast-store";
import {
  wholesaleRequestSchema,
  type WholesaleRequestInput,
  type WholesaleRequestValues,
} from "@/lib/validation/auth";

const FIELDS: readonly string[] = ["businessName", "rnc", "estimatedVolume"];

function isField(name: string): name is keyof WholesaleRequestInput {
  return FIELDS.includes(name);
}

export function WholesaleRequestForm({ defaults }: { defaults: WholesaleRequestInput }) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState } = useForm<
    WholesaleRequestInput,
    unknown,
    WholesaleRequestValues
  >({
    resolver: zodResolver(wholesaleRequestSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: WholesaleRequestValues) {
    const result = await requestWholesaleAccess(values);
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && isField(field)) setError(field, { message });
      }
      toast({ title: "No pudimos enviarla", description: result.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Solicitud enviada",
      description: "La revisaremos y te avisaremos por correo.",
      variant: "success",
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
      <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
        {isSubmitting ? "Enviando…" : "Solicitar cuenta al por mayor"}
      </Button>
    </form>
  );
}
