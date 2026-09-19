import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { emptyProductInput } from "@/lib/admin/product-form-defaults";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  await requireAdmin("/admin/productos/nuevo");
  const supabase = await createSessionClient();
  const [categories, brands] = await Promise.all([
    supabase.from("categories").select("id, name, parent_id").order("sort_order"),
    supabase.from("brands").select("id, name").order("sort_order"),
  ]);

  return (
    <>
      <Link
        href="/admin/productos"
        className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Productos
      </Link>
      <PageHeader
        title="Nuevo producto"
        description="Primero guarda los datos y las variantes; luego podrás subir sus imágenes."
      />
      <ProductForm
        defaults={emptyProductInput()}
        categories={(categories.data ?? []).map((category) => ({
          id: category.id,
          name: category.name,
          parentId: category.parent_id,
        }))}
        brands={brands.data ?? []}
      />
    </>
  );
}
