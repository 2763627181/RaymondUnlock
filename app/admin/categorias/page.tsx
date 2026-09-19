import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { PageHeader } from "@/components/admin/page-header";
import { createSessionClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/categorias");
  const supabase = await createSessionClient();
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("category_id"),
  ]);
  if (categories.error) throw new Error(categories.error.message);

  const productCounts: Record<string, number> = {};
  for (const product of products.data ?? []) {
    productCounts[product.category_id] = (productCounts[product.category_id] ?? 0) + 1;
  }

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organiza el catálogo en categorías y subcategorías. Arrastra para cambiar el orden en que se muestran."
      />
      <CategoriesManager categories={categories.data} productCounts={productCounts} />
    </>
  );
}
