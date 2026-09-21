"use client";

import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SentOrder {
  code: string;
  url: string;
}

/**
 * Confirmación del pedido. El navegador puede bloquear la ventana de WhatsApp
 * (se abre después de esperar al servidor): aquí queda el botón para abrirla.
 */
export function SentDialog({ order, onClose }: { order: SentOrder | null; onClose: () => void }) {
  return (
    <Dialog open={order !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <CheckCircle2 className="text-success-700 size-12" aria-hidden="true" />
          <DialogTitle className="text-xl">¡Pedido registrado!</DialogTitle>
          <DialogDescription>
            Tu pedido <strong className="text-foreground">{order?.code}</strong> quedó guardado. Se
            abrió WhatsApp con el mensaje listo; si no lo ves, ábrelo aquí.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button asChild className="bg-success-700 h-12 text-base text-white hover:bg-[#116932]">
            <a href={order?.url ?? "#"} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" /> Abrir WhatsApp
            </a>
          </Button>
          <Button variant="outline" className="h-12 text-base" onClick={onClose}>
            Seguir viendo el listado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
