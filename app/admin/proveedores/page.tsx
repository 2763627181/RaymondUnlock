import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ListFilters } from "@/components/admin/list-filters";
import { Pagination } from "@/components/admin/pagination";
import { WholesaleAdminHeader } from "@/components/admin/wholesale-admin-header";
import { WholesaleProductsTable } from "@/components/admin/wholesale-products-table";
import { Button } from "@/components/ui/button";
import { ADMIN_PAGE_SIZE, pageRange, parsePage, totalPages } from "@/lib/admin/pagination";
import { searchClause } from "@/lib/admin/quotes-query";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Listado mayorista" };

const first = (value: string | string[] | undefined) =>
  ((Array.isArray(value) ? value[0] : value) ?? "").slice(0, 80);

const distinct = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b, "es"));

export default async function AdminWholesalePage(props: PageProps<"/admin/proveedores">) {
  await requireAdmin("/admin/proveedores");
  const params = await props.searchParams;
  const q = first(params.q);
  const estado = first(params.estado);
  const categoria = first(params.categoria);
  const page = parsePage(params.page);
  const supabase = await createSessionClient();

  let query = supabase.from("wholesale_products").select("*", { count: "exact" });
  if (estado === "activo") query = query.eq("is_active", true);
  if (estado === "inactivo") query = query.eq("is_active", false);
  if (categoria) query = query.eq("category", categoria);
  const clause = searchClause(q, ["name", "category", "condition", "product_type"]);
  if (clause) query = query.or(clause);

  const { from, to } = pageRange(page);
  const [list, vocabulary] = await Promise.all([
    query.order("sort_order").order("name").range(from, to),
    // Para sugerir tipos, categorías y condiciones ya usados (y llenar el filtro de categoría).
    supabase.from("wholesale_products").select("product_type, category, condition").limit(1000),
  ]);
  if (list.error) throw new Error(list.error.message);

  const words = vocabulary.data ?? [];
  const categories = distinct(words.map((row) => row.category));
  const total = list.count ?? 0;

  return (
    <>
      <WholesaleAdminHeader
        title="Listado mayorista"
        description="La lista de precios al por mayor que se ve en /proveedores. Lo que cambies aquí se publica al instante."
        actions={
          <Button asChild variant="outline" className="h-10">
            <Link href="/proveedores" target="_blank" rel="noopener">
              Ver la página <ExternalLink aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ListFilters
        searchPlaceholder="Buscar por nombre, categoría o condición…"
        selects={[
          {
            name: "estado",
            label: "Todos los estados",
            options: [
              { value: "activo", label: "Visibles" },
              { value: "inactivo", label: "Ocultos" },
            ],
          },
          {
            name: "categoria",
            label: "Todas las categorías",
            options: categories.map((value) => ({ value, label: value })),
          },
        ]}
      />

      <WholesaleProductsTable
        products={list.data ?? []}
        filtered={Boolean(q || estado || categoria)}
        suggestions={{
          types: distinct(words.map((row) => row.product_type)),
          categories,
          conditions: distinct(words.map((row) => row.condition)),
        }}
      />

      <Pagination
        basePath="/admin/proveedores"
        params={{ q, estado, categoria }}
        page={page}
        totalPages={totalPages(total, ADMIN_PAGE_SIZE)}
        total={total}
      />
    </>
  );
}
