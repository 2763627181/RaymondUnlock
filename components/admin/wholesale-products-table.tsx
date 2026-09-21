"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Smartphone, Trash2 } from "lucide-react";
import { deleteWholesaleProduct } from "@/app/admin/proveedores/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { ActiveBadge } from "@/components/admin/status-badge";
import {
  WholesaleProductForm,
  type WholesaleProductRow,
  type WholesaleSuggestions,
} from "@/components/admin/wholesale-product-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

export function WholesaleProductsTable({
  products,
  suggestions,
  filtered,
}: {
  products: WholesaleProductRow[];
  suggestions: WholesaleSuggestions;
  /** Hay búsqueda o filtros puestos (cambia el mensaje cuando no hay resultados). */
  filtered: boolean;
}) {
  const router = useRouter();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <FormDialog
          title="Nuevo producto"
          description="Aparece en /proveedores en cuanto lo guardes."
          trigger={
            <Button className="h-10">
              <Plus /> Nuevo producto
            </Button>
          }
        >
          {(close) => <WholesaleProductForm suggestions={suggestions} onDone={close} />}
        </FormDialog>
      </div>

      {products.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          {filtered
            ? "No hay productos con esos filtros."
            : "Aún no hay productos en el listado al por mayor. Agrega el primero."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
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
                    <span className="max-w-72 font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>{product.product_type}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.condition}</TableCell>
                <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell>
                  <ActiveBadge active={product.is_active} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <FormDialog
                      title="Editar producto"
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${product.name}`}
                        >
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
                    <ConfirmButton
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 />
                        </Button>
                      }
                      title={`¿Eliminar “${product.name}”?`}
                      description="Sale del listado. Los pedidos que ya se enviaron conservan su nombre y precio."
                      successTitle="Producto eliminado"
                      onConfirm={() => deleteWholesaleProduct(product.id)}
                      onDone={() => router.refresh()}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
