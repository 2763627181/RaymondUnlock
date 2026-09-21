"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { submitRepairRequest, type RepairEmailStatus } from "@/app/(marketing)/servicios/actions";
import { ChannelField } from "@/components/forms/channel-field";
import { useEmailEnabled } from "@/components/forms/email-availability";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast-store";
import {
  repairFormSchema,
  type RepairFormInput,
  type RepairFormValues,
} from "@/lib/validation/repair";

const FORM_FIELDS: readonly string[] = [
  "customerName",
  "customerPhone",
  "customerEmail",
  "device",
  "serviceId",
  "issueDescription",
  "channel",
];

function isFormField(name: string): name is keyof RepairFormInput {
  return FORM_FIELDS.includes(name);
}

interface SentState {
  code: string;
  whatsappUrl: string;
  channel: RepairFormValues["channel"];
  emailStatus: RepairEmailStatus;
}

export function RepairRequestForm({
  services,
  defaultServiceId,
}: {
  services: { id: string; name: string }[];
  defaultServiceId?: string;
}) {
  const emailEnabled = useEmailEnabled();
  const [sent, setSent] = useState<SentState | null>(null);

  const form = useForm<RepairFormInput, unknown, RepairFormValues>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      device: "",
      serviceId: defaultServiceId ?? "",
      issueDescription: "",
      channel: "whatsapp",
      additionalInfo: "",
    },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: RepairFormValues) {
    const result = await submitRepairRequest(values);

    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && isFormField(field)) setError(field, { message });
      }
      toast({
        title: "No pudimos enviar tu solicitud",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    setSent({
      code: result.code,
      whatsappUrl: result.whatsappUrl,
      channel: values.channel,
      emailStatus: result.emailStatus,
    });
    // Si el navegador bloquea la pestaña, la tarjeta de confirmación tiene el botón.
    if (values.channel !== "email") {
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }

  const inputProps = (name: keyof RepairFormInput) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  if (sent) {
    return (
      <div className="border-border rounded-lg border p-8 text-center" role="status">
        <CheckCircle2 className="text-success mx-auto mb-4 size-12" aria-hidden="true" />
        <h3 className="text-2xl font-semibold tracking-tight">¡Solicitud enviada!</h3>
        <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
          Tu código es <strong className="text-foreground tabular-nums-price">{sent.code}</strong>.
          Te contactaremos para coordinar el diagnóstico.
        </p>
        {sent.emailStatus === "sent" ? (
          <p className="mt-2 text-sm">También te enviamos una copia por correo.</p>
        ) : null}
        {sent.emailStatus === "failed" || sent.emailStatus === "partial" ? (
          <p className="mt-2 text-sm">
            No pudimos enviar el correo, pero tu solicitud quedó registrada. Escríbenos por WhatsApp
            y la retomamos.
          </p>
        ) : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="h-11 px-6 text-base">
            <a href={sent.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" /> Abrir WhatsApp
            </a>
          </Button>
          <Button
            variant="outline"
            className="h-11 px-6 text-base"
            onClick={() => {
              setSent(null);
              reset();
            }}
          >
            Enviar otra solicitud
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="rr-customerName">Nombre</Label>
          <Input
            id="rr-customerName"
            autoComplete="name"
            className="mt-1.5 h-11"
            {...inputProps("customerName")}
            {...register("customerName")}
          />
          <FieldError id="customerName-error" message={errors.customerName?.message} />
        </div>
        <div>
          <Label htmlFor="rr-customerPhone">Teléfono</Label>
          <Input
            id="rr-customerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="809-000-0000"
            className="mt-1.5 h-11"
            {...inputProps("customerPhone")}
            {...register("customerPhone")}
          />
          <FieldError id="customerPhone-error" message={errors.customerPhone?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="rr-device">Equipo</Label>
          <Input
            id="rr-device"
            placeholder="Ej. iPhone 13, Galaxy A54"
            className="mt-1.5 h-11"
            {...inputProps("device")}
            {...register("device")}
          />
          <FieldError id="device-error" message={errors.device?.message} />
        </div>
        <div>
          <Label htmlFor="rr-serviceId">Servicio</Label>
          <select
            id="rr-serviceId"
            className="border-input bg-surface focus-visible:ring-ring mt-1.5 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
            {...inputProps("serviceId")}
            {...register("serviceId")}
          >
            <option value="">Elige un servicio</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <FieldError id="serviceId-error" message={errors.serviceId?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="rr-issueDescription">Cuéntanos el problema</Label>
        <Textarea
          id="rr-issueDescription"
          rows={4}
          maxLength={1000}
          placeholder="¿Qué le pasa al equipo? ¿Desde cuándo?"
          className="mt-1.5"
          {...inputProps("issueDescription")}
          {...register("issueDescription")}
        />
        <FieldError id="issueDescription-error" message={errors.issueDescription?.message} />
      </div>

      {emailEnabled ? (
        <>
          <ChannelField control={control} question="¿Cómo quieres que te respondamos?" />

          <div>
            <Label htmlFor="rr-customerEmail">
              Correo{" "}
              <span className="text-muted-foreground font-normal">
                (obligatorio si eliges correo)
              </span>
            </Label>
            <Input
              id="rr-customerEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="mt-1.5 h-11"
              {...inputProps("customerEmail")}
              {...register("customerEmail")}
            />
            <FieldError id="customerEmail-error" message={errors.customerEmail?.message} />
          </div>
        </>
      ) : null}

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
        {...register("additionalInfo")}
      />

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {isSubmitting ? "Enviando…" : "Solicitar diagnóstico"}
      </Button>
    </form>
  );
}
