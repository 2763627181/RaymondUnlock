"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LAST_QUOTE_KEY, parseLastQuote } from "@/lib/cart/last-quote";
import { useCartStore } from "@/lib/cart/store";
import { toast } from "@/lib/toast-store";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const subscribe = () => () => {};

function readStored(): string | null {
  try {
    return sessionStorage.getItem(LAST_QUOTE_KEY);
  } catch {
    return null;
  }
}

export function QuoteSent({ code, whatsappNumber }: { code: string; whatsappNumber: string }) {
  const raw = useSyncExternalStore(subscribe, readStored, () => null);
  const stored = parseLastQuote(raw);
  const quote = stored?.code === code ? stored : null;

  const itemCount = useCartStore((state) => state.items.length);
  const clear = useCartStore((state) => state.clear);

  const whatsappHref =
    quote?.whatsappUrl ??
    buildWhatsAppUrl(whatsappNumber, `Hola, envié la cotización ${code} desde la web.`);

  const emailNote =
    quote?.emailStatus === "sent"
      ? "También te enviamos la cotización por correo."
      : quote?.emailStatus === "partial"
        ? "Enviamos parte de los correos; si no ves el tuyo, revisa spam o escríbenos por WhatsApp."
        : quote?.emailStatus === "failed"
          ? "No pudimos enviar el correo, pero tu cotización quedó registrada. Escríbenos por WhatsApp y la retomamos."
          : null;

  return (
    <div className="mx-auto max-w-xl text-center">
      <CheckCircle2 className="text-success mx-auto mb-5 size-14" aria-hidden="true" />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">¡Cotización enviada!</h1>
      <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
        Tu código es <strong className="text-foreground tabular-nums-price">{code}</strong>. Te
        contactaremos para confirmar disponibilidad y precios.
      </p>
      {emailNote ? <p className="mt-3 text-sm">{emailNote}</p> : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="h-12 px-6 text-base">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" />
            {quote && quote.channel !== "email" ? "Abrir WhatsApp de nuevo" : "Abrir WhatsApp"}
          </a>
        </Button>
        <Button asChild variant="outline" className="h-12 px-6 text-base">
          <Link href="/tienda">Seguir comprando</Link>
        </Button>
      </div>

      {itemCount > 0 ? (
        <div className="border-border mt-10 border-t pt-6">
          <p className="text-muted-foreground text-sm">
            Tu carrito sigue guardado por si el chat no se abrió. Cuando todo esté listo, puedes
            vaciarlo.
          </p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => {
              clear();
              toast({ title: "Carrito vaciado", variant: "success" });
            }}
          >
            Vaciar carrito
          </Button>
        </div>
      ) : null}
    </div>
  );
}
