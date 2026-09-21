import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/admin/page-header";
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
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";
import { formatWhatsappNumber } from "@/lib/wholesale/format";

export const metadata: Metadata = { title: "Pedido al por mayor" };

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  );
}

export default async function AdminWholesaleOrderPage(
  props: PageProps<"/admin/proveedores/pedidos/[id]">,
) {
  const { id } = await props.params;
  await requireAdmin(`/admin/proveedores/pedidos/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createSessionClient();
  const [order, items] = await Promise.all([
    supabase.from("wholesale_orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("wholesale_order_items").select("*").eq("order_id", id).order("product_name"),
  ]);
  if (!order.data) notFound();
  const o = order.data;

  return (
    <>
      <Link
        href="/admin/proveedores/pedidos"
        className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Pedidos al por mayor
      </Link>
      <PageHeader
        title={`Pedido ${o.code}`}
        description={`Recibido el ${formatDateTime(o.created_at)}`}
        actions={<RequestStatusSelect kind="wholesale" id={o.id} status={o.status} />}
      />

      <dl className="bg-surface border-border mb-6 grid gap-4 rounded-xl border p-5 sm:grid-cols-3">
        <Detail label="Enviado a">{o.contact_label ?? "WhatsApp del negocio"}</Detail>
        <Detail label="WhatsApp">
          {o.contact_whatsapp ? formatWhatsappNumber(o.contact_whatsapp) : "—"}
        </Detail>
        <Detail label="Total">{formatPrice(o.total)}</Detail>
      </dl>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Condición</TableHead>
            <TableHead className="text-right">Cant.</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(items.data ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell className="max-w-80 font-medium">{item.product_name}</TableCell>
              <TableCell>{item.category ?? "—"}</TableCell>
              <TableCell>{item.condition ?? "—"}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                {formatPrice(item.unit_price)}
              </TableCell>
              <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                {formatPrice(item.line_total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
