import type { Metadata } from "next";
import Link from "next/link";
import { ListFilters } from "@/components/admin/list-filters";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
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
import { parseRequestFilters, searchClause } from "@/lib/admin/quotes-query";
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS } from "@/lib/admin/status";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Reparaciones" };

export default async function AdminRepairsPage(props: PageProps<"/admin/reparaciones">) {
  await requireAdmin("/admin/reparaciones");
  const filters = parseRequestFilters(await props.searchParams);
  const supabase = await createSessionClient();

  let query = supabase
    .from("repair_requests")
    .select(
      "id, code, customer_name, customer_phone, device, status, created_at, service:services(name)",
      { count: "exact" },
    );
  if (filters.status) query = query.eq("status", filters.status);
  const clause = searchClause(filters.q, ["code", "customer_name", "customer_phone", "device"]);
  if (clause) query = query.or(clause);

  const { from, to } = pageRange(filters.page);
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="Reparaciones"
        description="Solicitudes de diagnóstico y reparación que llegan desde /servicios."
      />

      <ListFilters
        searchPlaceholder="Buscar por código, cliente o equipo…"
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
              <TableHead>Cliente</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((repair) => (
              <TableRow key={repair.id}>
                <TableCell className="whitespace-nowrap">
                  <Link
                    href={`/admin/reparaciones/${repair.id}`}
                    className="text-brand-blue font-medium hover:underline"
                  >
                    {repair.code}
                  </Link>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{repair.customer_name}</p>
                  <p className="text-muted-foreground text-xs">{repair.customer_phone}</p>
                </TableCell>
                <TableCell>{repair.device}</TableCell>
                <TableCell>{repair.service?.name ?? "—"}</TableCell>
                <TableCell>
                  <RequestStatusSelect kind="repair" id={repair.id} status={repair.status} />
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(repair.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          No hay solicitudes que coincidan.
        </p>
      )}

      <Pagination
        basePath="/admin/reparaciones"
        params={{ q: filters.q, estado: filters.status }}
        page={filters.page}
        totalPages={totalPages(count ?? 0, ADMIN_PAGE_SIZE)}
        total={count ?? 0}
      />
    </>
  );
}
