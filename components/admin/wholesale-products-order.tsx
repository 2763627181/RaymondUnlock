"use client";

import Image from "next/image";
import { Pencil, Smartphone } from "lucide-react";
import { reorderWholesaleProducts } from "@/app/admin/proveedores/actions";
import { FormDialog } from "@/components/admin/form-dialog";
import { SortableList } from "@/components/admin/sortable-list";
import { ActiveBadge } from "@/components/admin/status-badge";
import {
  WholesaleProductForm,
  type WholesaleProductRow,
  type WholesaleSuggestions,
} from "@/components/admin/wholesale-product-form";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

/** Una categoría con sus productos, en el orden en que aparecen hoy en /alpormayor. */
export interface WholesaleCategoryGroup {
  category: string;
  items: WholesaleProductRow[];
}

/**
 * Reordenar dentro de cada categoría (arrastrando o con flechas): el mismo
 * SortableList de contactos/categorías, uno por categoría. Guardar reparte entre
 * esos productos los sort_order que ya tenían, así una categoría nunca le pisa
 * el lugar a la de al lado (ver reorderWholesaleProducts).
 */
export function WholesaleProductsOrder({
  groups,
  suggestions,
}: {
  groups: WholesaleCategoryGroup[];
  suggestions: WholesaleSuggestions;
}) {
  if (groups.length === 0) {
    return (
      <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
        Aún no hay productos en el listado al por mayor.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.category}>
          <h2 className="mb-3 text-sm font-bold tracking-wide uppercase">
            {group.category}{" "}
            <span className="text-muted-foreground font-normal">({group.items.length})</span>
          </h2>
          <SortableList
            items={group.items}
            label={`Productos de ${group.category}`}
            getLabel={(product) => product.name}
            onReorder={reorderWholesaleProducts}
            renderItem={(product) => (
              <div className="flex items-center gap-3">
                <div className="bg-surface-2 relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt=""
                      fill
                      unoptimized
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <Smartphone className="text-muted-foreground size-4" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-muted-foreground text-xs">{product.condition}</p>
                </div>
                <p className="tabular-nums-price shrink-0 text-sm font-semibold">
                  {formatPrice(product.price)}
                </p>
                {product.is_active ? null : <ActiveBadge active={false} />}
                <FormDialog
                  title="Editar producto"
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${product.name}`}>
                      <Pencil />
                    </Button>
                  }
                >
                  {(close) => (
                    <WholesaleProductForm
                      product={product}
                      suggestions={suggestions}
                      onDone={close}
                    />
                  )}
                </FormDialog>
              </div>
            )}
          />
        </section>
      ))}
    </div>
  );
}
