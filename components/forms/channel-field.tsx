"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", hint: "Se abre el chat con tu mensaje listo" },
  { value: "email", label: "Correo", hint: "Te lo enviamos por correo" },
  { value: "both", label: "Ambos", hint: "WhatsApp y correo" },
] as const;

/** Selector WhatsApp / Correo / Ambos. El formulario debe tener un campo `channel`. */
export function ChannelField<T extends FieldValues>({
  control,
  question,
}: {
  control: Control<T>;
  question: string;
}) {
  return (
    <div>
      <p id="channel-label" className="text-sm leading-none font-medium">
        {question}
      </p>
      <Controller
        control={control}
        name={"channel" as Path<T>}
        render={({ field }) => (
          <RadioGroup
            aria-labelledby="channel-label"
            value={field.value}
            onValueChange={field.onChange}
            className="mt-2 grid gap-2"
          >
            {CHANNELS.map((channel) => (
              <Label
                key={channel.value}
                htmlFor={`channel-${channel.value}`}
                className="border-border has-data-checked:border-ink flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal"
              >
                <RadioGroupItem
                  id={`channel-${channel.value}`}
                  value={channel.value}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium">{channel.label}</span>
                  <span className="text-muted-foreground block text-[13px]">{channel.hint}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  );
}
