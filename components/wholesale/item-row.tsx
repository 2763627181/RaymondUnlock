"use client";

import Image from "next/image";
import { Plus, Smartphone } from "lucide-react";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { formatPrice } from "@/lib/format";
import { useWholesaleCart } from "@/lib/wholesale/cart";
import { MAX_WHOLESALE_QUANTITY, type WholesaleItem } from "@/lib/wholesale/types";

/** Una fila del listado: foto, nombre, condición, precio y el botón "+" (o la cantidad si ya está en el pedido). */
export function ItemRow({ item }: { item: WholesaleItem }) {
  const quantity = useWholesaleCart(
    (state) => state.lines.find((line) => line.id === item.id)?.quantity ?? 0,
  );
  const add = useWholesaleCart((state) => state.add);
  const setQuantity = useWholesaleCart((state) => state.setQuantity);
  const remove = useWholesaleCart((state) => state.remove);

  return (
    <li className="border-border flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="bg-surface-2 border-border relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-contain p-1" />
        ) : (
          <Smartphone className="text-muted-foreground size-6" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-snug font-medium">{item.name}</p>
        <p className="text-success-700 mt-0.5 text-xs font-bold tracking-wide uppercase">
          {item.condition}
        </p>
      </div>

      <p className="tabular-nums-price shrink-0 text-base font-bold">{formatPrice(item.price)}</p>

      {quantity > 0 ? (
        <QuantityStepper
          size="sm"
          value={quantity}
          max={MAX_WHOLESALE_QUANTITY}
          label={`Cantidad de ${item.name}`}
          onChange={(next) => (next < 1 ? remove(item.id) : setQuantity(item.id, next))}
        />
      ) : (
        <button
          type="button"
          onClick={() => add(item)}
          aria-label={`Agregar ${item.name} al pedido`}
          className="bg-brand-red hover:bg-brand-red-600 focus-visible:ring-ring grid size-11 shrink-0 place-items-center rounded-xl text-white transition-colors outline-none focus-visible:ring-2"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
