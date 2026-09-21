import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/admin/page-header";
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
import { customerWhatsAppNumber } from "@/lib/admin/status";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/format";
import { createSessionClient } from "@/lib/supabase/server";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Cotización" };

const CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  email: "Correo",
  both: "WhatsApp y correo",
} as const;

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export default async function AdminQuoteDetailPage(props: PageProps<"/admin/cotizaciones/[id]">) {
  const { id } = await props.params;
  await requireAdmin(`/admin/cotizaciones/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createSessionClient();
  const [quote, items] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", id).maybeSingle(),
    supabase.from("quote_items").select("*").eq("quote_id", id).order("product_name"),
  ]);
  if (!quote.data) notFound();
  const q = quote.data;

  const whatsappUrl = buildWhatsAppUrl(
    customerWhatsAppNumber(q.customer_phone),
    `Hola ${q.customer_name}, te escribimos de Raymond Unlock sobre tu cotización ${q.code}.`,
  );

  return (
    <>
      <Link
        href="/admin/cotizaciones"
        className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Cotizaciones
      </Link>
      <PageHeader
        title={`Cotización ${q.code}`}
        description={`Recibida el ${formatDateTime(q.created_at)}`}
        actions={
          <>
            <RequestStatusSelect kind="quote" id={q.id} status={q.status} className="h-10 w-40" />
            <Button asChild className="h-10">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp del cliente
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="articulos">
          <h2 id="articulos" className="mb-3 text-lg font-semibold">
            Artículos
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items.data ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_label ? (
                      <p className="text-muted-foreground text-xs">{item.variant_label}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="tabular-nums-price text-right">{item.quantity}</TableCell>
                  <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                    {formatPrice(item.unit_price)}
                  </TableCell>
                  <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                    {formatPrice(item.line_total)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Subtotal
                </TableCell>
                <TableCell className="tabular-nums-price text-right text-base font-semibold whitespace-nowrap">
                  {formatPrice(q.subtotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-muted-foreground mt-2 text-xs">
            Los precios son los que el servidor calculó al enviar la cotización.
          </p>
        </section>

        <aside className="border-border bg-surface h-fit rounded-xl border p-5">
          <h2 className="mb-4 text-lg font-semibold">Cliente</h2>
          <dl className="space-y-3">
            <Detail label="Nombre">{q.customer_name}</Detail>
            <Detail label="Teléfono">
              <a
                href={`tel:${q.customer_phone}`}
                className="text-brand-blue inline-flex items-center gap-1 hover:underline"
              >
                <Phone className="size-3.5" aria-hidden="true" /> {q.customer_phone}
              </a>
            </Detail>
            {q.customer_email ? (
              <Detail label="Correo">
                <a
                  href={`mailto:${q.customer_email}`}
                  className="text-brand-blue inline-flex items-center gap-1 break-all hover:underline"
                >
                  <Mail className="size-3.5" aria-hidden="true" /> {q.customer_email}
                </a>
              </Detail>
            ) : null}
            <Detail label="Canal elegido">{CHANNEL_LABELS[q.channel]}</Detail>
            {q.note ? <Detail label="Nota del cliente">{q.note}</Detail> : null}
          </dl>
        </aside>
      </div>
    </>
  );
}
