import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ListFilters } from "@/components/admin/list-filters";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { ADMIN_PAGE_SIZE, parsePage, totalPages } from "@/lib/admin/pagination";
import { listAdminProducts, type ProductListFilters } from "@/lib/admin/products-query";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Productos" };

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminProductsPage(props: PageProps<"/admin/productos">) {
  await requireAdmin("/admin/productos");
  const params = await props.searchParams;

  const status = first(params.estado);
  const filters: ProductListFilters = {
    q: first(params.q).slice(0, 80),
    category: first(params.categoria),
    brand: first(params.marca),
    status: status === "activo" || status === "inactivo" ? status : "",
    lowStock: first(params.stock) === "bajo",
    page: parsePage(params.page),
  };

  const supabase = await createSessionClient();
  const [{ rows, total }, categories, brands] = await Promise.all([
    listAdminProducts(filters),
    supabase.from("categories").select("id, name, parent_id").order("sort_order"),
    supabase.from("brands").select("id, name").order("sort_order"),
  ]);

  return (
    <>
      <PageHeader
        title="Productos"
        description="Crea y edita productos, sus variantes, precios e imágenes."
        actions={
          <Button asChild className="h-10">
            <Link href="/admin/productos/nuevo">
              <Plus /> Nuevo producto
            </Link>
          </Button>
        }
      />

      <ListFilters
        searchPlaceholder="Buscar por nombre…"
        selects={[
          {
            name: "categoria",
            label: "Todas las categorías",
            options: (categories.data ?? []).map((category) => ({
              value: category.id,
              label: category.parent_id ? `— ${category.name}` : category.name,
            })),
          },
          {
            name: "marca",
            label: "Todas las marcas",
            options: (brands.data ?? []).map((brand) => ({ value: brand.id, label: brand.name })),
          },
          {
            name: "estado",
            label: "Cualquier estado",
            options: [
              { value: "activo", label: "Publicados" },
              { value: "inactivo", label: "Ocultos" },
            ],
          },
          {
            name: "stock",
            label: "Todo el stock",
            options: [{ value: "bajo", label: "Poco stock" }],
          },
        ]}
      />

      <ProductsTable rows={rows} />
      <Pagination
        basePath="/admin/productos"
        params={{
          q: filters.q,
          categoria: filters.category,
          marca: filters.brand,
          estado: filters.status,
          stock: filters.lowStock ? "bajo" : "",
        }}
        page={filters.page}
        totalPages={totalPages(total, ADMIN_PAGE_SIZE)}
        total={total}
      />
    </>
  );
}
