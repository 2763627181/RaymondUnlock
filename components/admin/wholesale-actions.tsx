"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { reviewWholesale } from "@/app/admin/mayoristas/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import { toast } from "@/lib/toast-store";

export type WholesaleState = "pendiente" | "aprobada" | "rechazada";

export function WholesaleActions({
  userId,
  name,
  state,
}: {
  userId: string;
  name: string;
  state: WholesaleState;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function approve() {
    setPending(true);
    const result = await runAction(reviewWholesale(userId, "approve"));
    setPending(false);
    if (!result.ok) return;
    toast({
      title: "Cuenta aprobada",
      description: result.data.emailSent
        ? "Le avisamos por correo."
        : "No se pudo enviar el correo de aviso: avísale por WhatsApp.",
      variant: result.data.emailSent ? "success" : "default",
    });
    router.refresh();
  }

  const reject = (
    <ConfirmButton
      trigger={
        <Button variant="outline" size="sm" disabled={pending}>
          <X /> {state === "aprobada" ? "Revocar" : "Rechazar"}
        </Button>
      }
      title={
        state === "aprobada"
          ? `¿Revocar el acceso de ${name}?`
          : `¿Rechazar la solicitud de ${name}?`
      }
      description="Su cuenta sigue activa pero vuelve a ver solo precios por unidad. Le avisamos por correo."
      confirmLabel={state === "aprobada" ? "Revocar acceso" : "Rechazar"}
      successTitle="Decisión guardada"
      onConfirm={() => reviewWholesale(userId, "reject")}
      onDone={() => router.refresh()}
    />
  );

  return (
    <div className="flex justify-end gap-2">
      {state === "aprobada" ? null : (
        <Button size="sm" onClick={approve} disabled={pending}>
          <Check /> {pending ? "Aprobando…" : "Aprobar"}
        </Button>
      )}
      {state === "rechazada" ? null : reject}
    </div>
  );
}
