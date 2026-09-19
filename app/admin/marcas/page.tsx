import type { Metadata } from "next";
import { BrandsManager } from "@/components/admin/brands-manager";
import { PageHeader } from "@/components/admin/page-header";
import { createSessionClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Marcas" };

export default async function AdminBrandsPage() {
  await requireAdmin("/admin/marcas");
  const supabase = await createSessionClient();
  const [brands, products] = await Promise.all([
    supabase.from("brands").select("*").order("sort_order"),
    supabase.from("products").select("brand_id"),
  ]);
  if (brands.error) throw new Error(brands.error.message);

  const productCounts: Record<string, number> = {};
  for (const product of products.data ?? []) {
    if (product.brand_id) {
      productCounts[product.brand_id] = (productCounts[product.brand_id] ?? 0) + 1;
    }
  }

  return (
    <>
      <PageHeader
        title="Marcas"
        description="Las marcas aparecen como filtro en la tienda. Arrastra para cambiar el orden."
      />
      <BrandsManager brands={brands.data} productCounts={productCounts} />
    </>
  );
}
