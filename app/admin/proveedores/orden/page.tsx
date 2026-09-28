import type { Metadata } from "next";
import { WholesaleAdminHeader } from "@/components/admin/wholesale-admin-header";
import { WholesaleProductsOrder } from "@/components/admin/wholesale-products-order";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export const metadata: Metadata = { title: "Orden del listado mayorista" };

const distinct = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b, "es"));

/** Igual que en /alpormayor: se agrupa por categoría respetando el orden en que aparecen. */
function groupByCategory(products: Tables<"wholesale_products">[]) {
  const groups = new Map<string, Tables<"wholesale_products">[]>();
  for (const product of products) {
    const group = groups.get(product.category);
    if (group) group.push(product);
    else groups.set(product.category, [product]);
  }
  return [...groups].map(([category, items]) => ({ category, items }));
}

export default async function AdminWholesaleOrderPage() {
  await requireAdmin("/admin/proveedores/orden");
  const supabase = await createSessionClient();

  const { data, error } = await supabase
    .from("wholesale_products")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);

  const products = data ?? [];

  return (
    <>
      <WholesaleAdminHeader
        title="Orden del listado mayorista"
        description="Arrastra un producto (o usa las flechas) para subirlo o bajarlo dentro de su categoría. Los productos nuevos entran al final; desde aquí los mueves adonde quieras."
      />
      <WholesaleProductsOrder
        groups={groupByCategory(products)}
        suggestions={{
          types: distinct(products.map((product) => product.product_type)),
          categories: distinct(products.map((product) => product.category)),
          conditions: distinct(products.map((product) => product.condition)),
        }}
      />
    </>
  );
}
