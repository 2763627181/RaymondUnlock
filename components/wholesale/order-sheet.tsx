"use client";

import { ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { lineTotal, useWholesaleCart, wholesaleCount, wholesaleTotal } from "@/lib/wholesale/cart";
import { MAX_WHOLESALE_QUANTITY } from "@/lib/wholesale/types";

/** "Tu pedido": las líneas con su cantidad, el total y el envío por WhatsApp. */
export function OrderSheet({
  open,
  onOpenChange,
  sending,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sending: boolean;
  onSend: () => void;
}) {
  const lines = useWholesaleCart((state) => state.lines);
  const setQuantity = useWholesaleCart((state) => state.setQuantity);
  const remove = useWholesaleCart((state) => state.remove);
  const clear = useWholesaleCart((state) => state.clear);
  const count = wholesaleCount(lines);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-h-[88dvh] max-w-3xl gap-0 rounded-t-3xl p-0"
      >
        <div aria-hidden="true" className="bg-border mx-auto mt-2.5 h-1.5 w-14 rounded-full" />
        <div className="flex items-center gap-3 px-5 pt-3 pb-4">
          <span className="bg-brand-red/10 text-brand-red grid size-12 place-items-center rounded-xl">
            <ShoppingBag className="size-5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <SheetTitle className="text-lg font-semibold">Tu pedido</SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              {count} {count === 1 ? "producto" : "productos"}
            </SheetDescription>
          </div>
        </div>

        <ul className="border-border flex-1 divide-y overflow-y-auto border-t">
          {lines.length === 0 ? (
            <li className="text-muted-foreground p-8 text-center text-sm">
              Aún no has agregado productos.
            </li>
          ) : null}
          {lines.map((line) => (
            <li key={line.id} className="flex items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-snug font-medium">{line.snapshot.name}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {formatPrice(line.snapshot.price)} c/u
                </p>
              </div>
              <QuantityStepper
                size="sm"
                value={line.quantity}
                max={MAX_WHOLESALE_QUANTITY}
                label={`Cantidad de ${line.snapshot.name}`}
                onChange={(next) => setQuantity(line.id, next)}
              />
              <button
                type="button"
                onClick={() => remove(line.id)}
                aria-label={`Quitar ${line.snapshot.name} del pedido`}
                className="text-muted-foreground hover:text-foreground grid size-9 shrink-0 place-items-center rounded-full"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
              <p className="tabular-nums-price w-24 shrink-0 text-right text-base font-bold">
                {formatPrice(lineTotal(line))}
              </p>
            </li>
          ))}
        </ul>

        <div className="bg-surface-2 border-border border-t px-5 pt-4 pb-5">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-muted-foreground text-base">Total</span>
            <span className="tabular-nums-price text-2xl font-bold">
              {formatPrice(wholesaleTotal(lines))}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-14 flex-1 rounded-xl text-base"
              disabled={lines.length === 0 || sending}
              onClick={clear}
            >
              Vaciar
            </Button>
            <Button
              className="bg-success-700 h-14 flex-[2] rounded-xl text-base text-white hover:bg-[#116932]"
              disabled={lines.length === 0 || sending}
              onClick={onSend}
            >
              <MessageCircle aria-hidden="true" />
              {sending ? "Enviando…" : "Enviar por WhatsApp"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
