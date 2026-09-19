"use client";

import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteBrand, reorderBrands } from "@/app/admin/marcas/actions";
import { BrandForm, type BrandRow } from "@/components/admin/brand-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { RowActions, SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";

export function BrandsManager({
  brands,
  productCounts,
}: {
  brands: BrandRow[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <FormDialog
          title="Nueva marca"
          trigger={
            <Button className="h-10">
              <Plus /> Nueva marca
            </Button>
          }
        >
          {(close) => <BrandForm onDone={close} />}
        </FormDialog>
      </div>

      {brands.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          Aún no hay marcas.
        </p>
      ) : (
        <SortableList
          items={brands}
          label="Marcas"
          getLabel={(brand) => brand.name}
          onReorder={reorderBrands}
          renderItem={(brand) => {
            const count = productCounts[brand.id] ?? 0;
            return (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{brand.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    /{brand.slug} · {count} {count === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <RowActions>
                  <FormDialog
                    title="Editar marca"
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Editar ${brand.name}`}>
                        <Pencil />
                      </Button>
                    }
                  >
                    {(close) => <BrandForm brand={brand} onDone={close} />}
                  </FormDialog>
                  <ConfirmButton
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${brand.name}`}>
                        <Trash2 />
                      </Button>
                    }
                    title={`¿Eliminar “${brand.name}”?`}
                    description="Solo se puede eliminar si ningún producto la usa. Esta acción no se puede deshacer."
                    successTitle="Marca eliminada"
                    onConfirm={() => deleteBrand(brand.id)}
                    onDone={() => router.refresh()}
                  />
                </RowActions>
              </div>
            );
          }}
        />
      )}
    </>
  );
}
