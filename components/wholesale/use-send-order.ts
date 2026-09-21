"use client";

import { useState } from "react";
import { submitWholesaleOrder } from "@/app/proveedores/actions";
import type { SentOrder } from "@/components/wholesale/sent-dialog";
import { toast } from "@/lib/toast-store";
import { useWholesaleCart } from "@/lib/wholesale/cart";
import type { WholesaleContact } from "@/lib/wholesale/types";

/**
 * Manda el pedido al servidor (solo ids y cantidades), abre WhatsApp con el
 * mensaje que devuelve y vacía el pedido. Si el servidor dice que algún producto
 * ya no está en la lista, lo quita para que el cliente revise.
 */
export function useSendOrder() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SentOrder | null>(null);

  async function send(contact: WholesaleContact | null): Promise<boolean> {
    const { lines, remove, clear } = useWholesaleCart.getState();
    setSending(true);
    const result = await submitWholesaleOrder({
      items: lines.map((line) => ({ productId: line.id, quantity: line.quantity })),
      contactId: contact?.id ?? null,
    });
    setSending(false);

    if (!result.ok) {
      for (const id of result.unavailableIds ?? []) remove(id);
      toast({
        title: "No pudimos enviar tu pedido",
        description: result.message,
        variant: "destructive",
      });
      return false;
    }

    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    clear();
    setSent({ code: result.code, url: result.whatsappUrl });
    return true;
  }

  return { sending, sent, dismissSent: () => setSent(null), send };
}
