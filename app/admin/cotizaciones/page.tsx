import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { ListFilters } from "@/components/admin/list-filters";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { Button } from "@/components/ui/button";
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

export const metadata: Metadata = { title: "Cotizaciones" };

const CHANNEL_LABELS = { whatsapp: "WhatsApp", email: "Correo", both: "Ambos" } as const;

export default async function AdminQuotesPage(props: PageProps<"/admin/cotizaciones">) {
  await requireAdmin("/admin/cotizaciones");
  const filters = parseRequestFilters(await props.searchParams);
  const supabase = await createSessionClient();

  let query = supabase
    .from("quotes")
    .select(
      "id, code, customer_name, customer_phone, tier, channel, status, subtotal, created_at",
      {
        count: "exact",
      },
    );
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.tier) query = query.eq("tier", filters.tier);
  const clause = searchClause(filters.q, [
    "code",
    "customer_name",
    "customer_phone",
    "customer_email",
    "business_name",
  ]);
  if (clause) query = query.or(clause);

  const { from, to } = pageRange(filters.page);
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);

  const exportParams = new URLSearchParams(
    Object.entries(filtersToParams(filters)).filter(([, value]) => value !== ""),
  ).toString();

  return (
    <>
      <PageHeader
        title="Cotizaciones"
        description="Solicitudes que llegan del carrito. Cambia el estado según avances con cada cliente."
        actions={
          <Button asChild variant="outline" className="h-10">
            <a href={`/admin/cotizaciones/export${exportParams ? `?${exportParams}` : ""}`}>
              <Download /> Exportar CSV
            </a>
          </Button>
        }
      />

      <ListFilters
        searchPlaceholder="Buscar por código, cliente o teléfono…"
        selects={[
          {
            name: "estado",
            label: "Todos los estados",
            options: REQUEST_STATUSES.map((value) => ({
              value,
              label: REQUEST_STATUS_LABELS[value],
            })),
          },
          {
            name: "tipo",
            label: "Cualquier precio",
            options: [
              { value: "retail", label: "Unidad" },
              { value: "wholesale", label: "Por mayor" },
            ],
          },
        ]}
      />

      {data && data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="whitespace-nowrap">
                  <Link
                    href={`/admin/cotizaciones/${quote.id}`}
                    className="text-brand-blue font-medium hover:underline"
                  >
                    {quote.code}
                  </Link>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{quote.customer_name}</p>
                  <p className="text-muted-foreground text-xs">{quote.customer_phone}</p>
                </TableCell>
                <TableCell>{quote.tier === "wholesale" ? "Por mayor" : "Unidad"}</TableCell>
                <TableCell>{CHANNEL_LABELS[quote.channel]}</TableCell>
                <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                  {formatPrice(quote.subtotal)}
                </TableCell>
                <TableCell>
                  <RequestStatusSelect kind="quote" id={quote.id} status={quote.status} />
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(quote.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          No hay cotizaciones que coincidan.
        </p>
      )}

      <Pagination
        basePath="/admin/cotizaciones"
        params={filtersToParams(filters)}
        page={filters.page}
        totalPages={totalPages(count ?? 0, ADMIN_PAGE_SIZE)}
        total={count ?? 0}
      />
    </>
  );
}
