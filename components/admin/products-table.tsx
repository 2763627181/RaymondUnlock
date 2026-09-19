"use client";

import { useOptimistic, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Copy, Eye, EyeOff, Pencil, Star, Trash2 } from "lucide-react";
import { deleteProduct, duplicateProduct, setProductsActive } from "@/app/admin/productos/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActiveBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/admin/format-date";
import type { ProductListRow } from "@/lib/admin/products-query";
import { runAction } from "@/lib/admin/run-action";
import { formatPrice } from "@/lib/format";

function priceRange(row: ProductListRow): string {
  if (row.minPrice === null || row.maxPrice === null) return "—";
  return row.minPrice === row.maxPrice
    ? formatPrice(row.minPrice)
    : `${formatPrice(row.minPrice)} – ${formatPrice(row.maxPrice)}`;
}

export function ProductsTable({ rows }: { rows: ProductListRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const [optimisticRows, setOptimistic] = useOptimistic(
    rows,
    (state, change: { ids: string[]; active: boolean }) =>
      state.map((row) => (change.ids.includes(row.id) ? { ...row, isActive: change.active } : row)),
  );

  const allSelected = optimisticRows.length > 0 && selected.size === optimisticRows.length;

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function setActive(ids: string[], active: boolean) {
    startTransition(async () => {
      // La fila cambia al instante; si el servidor la rechaza, vuelve a su estado.
      setOptimistic({ ids, active });
      const result = await runAction(
        setProductsActive(ids, active),
        active ? "Productos publicados" : "Productos ocultados",
      );
      if (result.ok) {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  async function duplicate(id: string) {
    const result = await runAction(duplicateProduct(id), "Producto duplicado (queda oculto)");
    if (result.ok) router.push(`/admin/productos/${result.data.id}`);
  }

  if (optimisticRows.length === 0) {
    return (
      <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
        No hay productos que coincidan con la búsqueda.
      </p>
    );
  }

  return (
    <>
      {selected.size > 0 ? (
        <div
          role="region"
          aria-label="Acciones en lote"
          className="bg-ink text-surface mb-3 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-sm"
        >
          <span className="font-medium">{selected.size} seleccionados</span>
          <Button size="sm" variant="secondary" onClick={() => setActive([...selected], true)}>
            <Eye /> Publicar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setActive([...selected], false)}>
            <EyeOff /> Ocultar
          </Button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-white/70 underline underline-offset-2 hover:text-white"
          >
            Cancelar selección
          </button>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Seleccionar todos los productos de esta página"
                checked={allSelected}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked === true ? new Set(optimisticRows.map((row) => row.id)) : new Set(),
                  )
                }
              />
            </TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Precio unidad</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Actualizado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {optimisticRows.map((row) => (
            <TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined}>
              <TableCell>
                <Checkbox
                  aria-label={`Seleccionar ${row.name}`}
                  checked={selected.has(row.id)}
                  onCheckedChange={(checked) => toggle(row.id, checked === true)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="bg-surface-2 relative size-12 shrink-0 overflow-hidden rounded-lg">
                    {row.imageUrl ? (
                      <Image
                        src={row.imageUrl}
                        alt=""
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/productos/${row.id}`}
                      className="text-brand-blue flex items-center gap-1 font-medium hover:underline"
                    >
                      {row.name}
                      {row.isFeatured ? (
                        <Star
                          className="size-3.5 fill-amber-400 text-amber-500"
                          aria-label="Destacado"
                        />
                      ) : null}
                    </Link>
                    <p className="text-muted-foreground truncate text-xs">
                      {[row.brand, row.category].filter(Boolean).join(" · ") || "Sin categoría"} ·{" "}
                      {row.variantCount} {row.variantCount === 1 ? "variante" : "variantes"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="tabular-nums-price whitespace-nowrap">
                {priceRange(row)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <span className="tabular-nums-price">{row.stock}</span>
                {row.hasLowStock ? (
                  <AlertTriangle
                    className="text-brand-red-600 ml-1.5 inline size-4"
                    aria-label="Poco stock en alguna variante"
                  />
                ) : null}
              </TableCell>
              <TableCell>
                <ActiveBadge active={row.isActive} />
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {formatDate(row.updatedAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link href={`/admin/productos/${row.id}`} aria-label={`Editar ${row.name}`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Duplicar ${row.name}`}
                    onClick={() => void duplicate(row.id)}
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={row.isActive ? `Ocultar ${row.name}` : `Publicar ${row.name}`}
                    onClick={() => setActive([row.id], !row.isActive)}
                  >
                    {row.isActive ? <EyeOff /> : <Eye />}
                  </Button>
                  <ConfirmButton
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${row.name}`}>
                        <Trash2 />
                      </Button>
                    }
                    title={`¿Eliminar “${row.name}”?`}
                    description="Se borran sus variantes e imágenes. Si tiene cotizaciones asociadas no se puede eliminar: ocúltalo en su lugar."
                    successTitle="Producto eliminado"
                    onConfirm={() => deleteProduct(row.id)}
                    onDone={() => router.refresh()}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
