"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitQuote } from "@/app/(marketing)/carrito/actions";
import { ChannelField } from "@/components/forms/channel-field";
import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveLastQuote } from "@/lib/cart/last-quote";
import { useCartStore } from "@/lib/cart/store";
import { useCartPricing } from "@/lib/cart/use-cart-pricing";
import { toast } from "@/lib/toast-store";
import { useViewerStore } from "@/lib/viewer/store";
import { quoteFormSchema, type QuoteFormInput, type QuoteFormValues } from "@/lib/validation/quote";

const FORM_FIELDS: readonly string[] = [
  "customerName",
  "customerPhone",
  "customerEmail",
  "businessName",
  "note",
  "channel",
];

function isFormField(name: string): name is keyof QuoteFormInput {
  return FORM_FIELDS.includes(name);
}

export function QuoteForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.remove);
  const { subtotal: displaySubtotal } = useCartPricing(items);

  const form = useForm<QuoteFormInput, unknown, QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      businessName: "",
      note: "",
      channel: "whatsapp",
      additionalInfo: "",
    },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, setValue, getValues, formState } = form;
  const { errors, isSubmitting } = formState;

  // Con sesión iniciada se precargan sus datos, sin pisar lo que ya escribió.
  const contact = useViewerStore((state) => state.contact);
  useEffect(() => {
    if (!contact) return;
    const prefill = [
      ["customerName", contact.fullName],
      ["customerPhone", contact.phone],
      ["customerEmail", contact.email],
      ["businessName", contact.businessName],
    ] as const;
    for (const [field, value] of prefill) {
      if (value && !getValues(field)) setValue(field, value);
    }
  }, [contact, getValues, setValue]);

  async function onSubmit(values: QuoteFormValues) {
    const result = await submitQuote({
      ...values,
      items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
    });

    if (!result.ok) {
      if (result.unavailableVariantIds) {
        for (const variantId of result.unavailableVariantIds) removeItem(variantId);
      }
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (message && isFormField(field)) setError(field, { message });
      }
      toast({
        title: "No pudimos enviar tu cotización",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    saveLastQuote({
      code: result.code,
      whatsappUrl: result.whatsappUrl,
      subtotal: result.subtotal,
      channel: values.channel,
      emailStatus: result.emailStatus,
    });

    if (Math.round(result.subtotal) !== Math.round(displaySubtotal)) {
      toast({
        title: "Actualizamos los precios",
        description: "Algunos precios cambiaron desde que agregaste los productos.",
      });
    }

    // Se abre en pestaña nueva para no perder el sitio; si el navegador la bloquea,
    // la pantalla de confirmación ofrece el botón para abrirla.
    if (values.channel !== "email") {
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    }
    router.push(`/carrito/enviado?code=${encodeURIComponent(result.code)}`);
  }

  const inputProps = (name: keyof QuoteFormInput) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <Label htmlFor="customerName">Nombre</Label>
        <Input
          id="customerName"
          autoComplete="name"
          className="mt-1.5 h-11"
          {...inputProps("customerName")}
          {...register("customerName")}
        />
        <FieldError id="customerName-error" message={errors.customerName?.message} />
      </div>

      <div>
        <Label htmlFor="customerPhone">Teléfono</Label>
        <Input
          id="customerPhone"
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

      <ChannelField control={control} question="¿Cómo quieres recibir tu cotización?" />

      <div>
        <Label htmlFor="customerEmail">
          Correo{" "}
          <span className="text-muted-foreground font-normal">(obligatorio si eliges correo)</span>
        </Label>
        <Input
          id="customerEmail"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="mt-1.5 h-11"
          {...inputProps("customerEmail")}
          {...register("customerEmail")}
        />
        <FieldError id="customerEmail-error" message={errors.customerEmail?.message} />
      </div>

      <div>
        <Label htmlFor="businessName">
          Nombre del negocio <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="businessName"
          autoComplete="organization"
          className="mt-1.5 h-11"
          {...register("businessName")}
        />
      </div>

      <div>
        <Label htmlFor="note">
          Nota <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="note"
          rows={3}
          maxLength={500}
          className="mt-1.5"
          {...inputProps("note")}
          {...register("note")}
        />
        <FieldError id="note-error" message={errors.note?.message} />
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
        {...register("additionalInfo")}
      />

      <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base">
        {isSubmitting ? "Enviando…" : "Enviar cotización"}
      </Button>
    </form>
  );
}
