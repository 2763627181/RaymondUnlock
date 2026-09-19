"use client";

import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCategory, reorderCategories } from "@/app/admin/categorias/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CategoryForm, type CategoryRow } from "@/components/admin/category-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { RowActions, SortableList } from "@/components/admin/sortable-list";
import { ActiveBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/lib/icons";

function CategoryLine({
  category,
  parents,
  productCount,
}: {
  category: CategoryRow;
  parents: CategoryRow[];
  productCount: number;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3">
      <span className="bg-surface-2 flex size-9 shrink-0 items-center justify-center rounded-full">
        <DynamicIcon name={category.icon} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{category.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          /{category.slug} · {productCount} {productCount === 1 ? "producto" : "productos"}
        </p>
      </div>
      {category.is_active ? null : <ActiveBadge active={false} />}
      <RowActions>
        <FormDialog
          title="Editar categoría"
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={`Editar ${category.name}`}>
              <Pencil />
            </Button>
          }
        >
          {(close) => (
            <CategoryForm
              category={category}
              parents={parents.filter((parent) => parent.id !== category.id)}
              onDone={close}
            />
          )}
        </FormDialog>
        <ConfirmButton
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${category.name}`}>
              <Trash2 />
            </Button>
          }
          title={`¿Eliminar “${category.name}”?`}
          description="Solo se puede eliminar si no tiene productos ni subcategorías. Esta acción no se puede deshacer."
          successTitle="Categoría eliminada"
          onConfirm={() => deleteCategory(category.id)}
          onDone={() => router.refresh()}
        />
      </RowActions>
    </div>
  );
}

export function CategoriesManager({
  categories,
  productCounts,
}: {
  categories: CategoryRow[];
  productCounts: Record<string, number>;
}) {
  const parents = categories.filter((category) => category.parent_id === null);
  const childrenOf = (id: string) => categories.filter((category) => category.parent_id === id);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <FormDialog
          title="Nueva categoría"
          trigger={
            <Button className="h-10">
              <Plus /> Nueva categoría
            </Button>
          }
        >
          {(close) => <CategoryForm parents={parents} onDone={close} />}
        </FormDialog>
      </div>

      {parents.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          Aún no hay categorías.
        </p>
      ) : (
        <SortableList
          items={parents}
          label="Categorías"
          getLabel={(category) => category.name}
          onReorder={reorderCategories}
          renderItem={(parent) => {
            const children = childrenOf(parent.id);
            return (
              <div>
                <CategoryLine
                  category={parent}
                  parents={parents}
                  productCount={productCounts[parent.id] ?? 0}
                />
                {children.length > 0 ? (
                  <div className="mt-3 border-l pl-3">
                    <SortableList
                      items={children}
                      label={`Subcategorías de ${parent.name}`}
                      getLabel={(category) => category.name}
                      onReorder={reorderCategories}
                      renderItem={(child) => (
                        <CategoryLine
                          category={child}
                          parents={parents}
                          productCount={productCounts[child.id] ?? 0}
                        />
                      )}
                    />
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      )}
    </>
  );
}
