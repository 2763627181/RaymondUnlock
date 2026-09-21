import type { Metadata } from "next";
import Link from "next/link";
import { ListFilters } from "@/components/admin/list-filters";
import { Pagination } from "@/components/admin/pagination";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { WholesaleAdminHeader } from "@/components/admin/wholesale-admin-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/admin/format-date";
import { ADMIN_PAGE_SIZE, pageRange, totalPages } from "@/lib/admin/pagination";
import { filtersToParams, parseRequestFilters, searchClause } from "@/lib/admin/quotes-query";
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS } from "@/lib/admin/status";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pedidos al por mayor" };

export default async function AdminWholesaleOrdersPage(
  props: PageProps<"/admin/proveedores/pedidos">,
) {
  await requireAdmin("/admin/proveedores/pedidos");
  const filters = parseRequestFilters(await props.searchParams);
  const supabase = await createSessionClient();

  let query = supabase
    .from("wholesale_orders")
    .select("id, code, contact_label, total, status, created_at", { count: "exact" });
  if (filters.status) query = query.eq("status", filters.status);
  const clause = searchClause(filters.q, ["code", "contact_label"]);
  if (clause) query = query.or(clause);

  const { from, to } = pageRange(filters.page);
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);

  return (
    <>
      <WholesaleAdminHeader
        title="Pedidos al por mayor"
        description="Los pedidos que los clientes enviaron desde /proveedores. Cambia el estado según avances."
      />

      <ListFilters
        searchPlaceholder="Buscar por código o vendedor…"
        selects={[
          {
            name: "estado",
            label: "Todos los estados",
            options: REQUEST_STATUSES.map((value) => ({
              value,
              label: REQUEST_STATUS_LABELS[value],
            })),
          },
        ]}
      />

      {data && data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Enviado a</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="whitespace-nowrap">
                  <Link
                    href={`/admin/proveedores/pedidos/${order.id}`}
                    className="text-brand-blue font-medium hover:underline"
                  >
                    {order.code}
                  </Link>
                </TableCell>
                <TableCell>{order.contact_label ?? "WhatsApp del negocio"}</TableCell>
                <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                  {formatPrice(order.total)}
                </TableCell>
                <TableCell>
                  <RequestStatusSelect kind="wholesale" id={order.id} status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(order.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          {filters.q || filters.status
            ? "No hay pedidos con esos filtros."
            : "Aún no hay pedidos. Cuando un cliente envíe uno desde /proveedores, aparece aquí."}
        </p>
      )}

      <Pagination
        basePath="/admin/proveedores/pedidos"
        params={filtersToParams(filters)}
        page={filters.page}
        totalPages={totalPages(count ?? 0, ADMIN_PAGE_SIZE)}
        total={count ?? 0}
      />
    </>
  );
}
