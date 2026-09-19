import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/admin/page-header";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/admin/format-date";
import { customerWhatsAppNumber } from "@/lib/admin/status";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Reparación" };

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export default async function AdminRepairDetailPage(props: PageProps<"/admin/reparaciones/[id]">) {
  const { id } = await props.params;
  await requireAdmin(`/admin/reparaciones/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();

  const { data: repair } = await (
    await createSessionClient()
  )
    .from("repair_requests")
    .select("*, service:services(name)")
    .eq("id", id)
    .maybeSingle();
  if (!repair) notFound();

  const whatsappUrl = buildWhatsAppUrl(
    customerWhatsAppNumber(repair.customer_phone),
    `Hola ${repair.customer_name}, te escribimos de Raymond Unlock sobre tu solicitud ${repair.code} (${repair.device}).`,
  );

  return (
    <>
      <Link
        href="/admin/reparaciones"
        className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Reparaciones
      </Link>
      <PageHeader
        title={`Solicitud ${repair.code}`}
        description={`Recibida el ${formatDateTime(repair.created_at)}`}
        actions={
          <>
            <RequestStatusSelect
              kind="repair"
              id={repair.id}
              status={repair.status}
              className="h-10 w-40"
            />
            <Button asChild className="h-10">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp del cliente
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border-border bg-surface rounded-xl border p-5">
          <h2 className="mb-4 text-lg font-semibold">Equipo y problema</h2>
          <dl className="space-y-3">
            <Detail label="Equipo">{repair.device}</Detail>
            <Detail label="Servicio solicitado">{repair.service?.name ?? "—"}</Detail>
            <Detail label="Descripción del problema">
              <span className="whitespace-pre-wrap">{repair.issue_description}</span>
            </Detail>
          </dl>
        </section>

        <section className="border-border bg-surface rounded-xl border p-5">
          <h2 className="mb-4 text-lg font-semibold">Cliente</h2>
          <dl className="space-y-3">
            <Detail label="Nombre">{repair.customer_name}</Detail>
            <Detail label="Teléfono">
              <a
                href={`tel:${repair.customer_phone}`}
                className="text-brand-blue inline-flex items-center gap-1 hover:underline"
              >
                <Phone className="size-3.5" aria-hidden="true" /> {repair.customer_phone}
              </a>
            </Detail>
            {repair.customer_email ? (
              <Detail label="Correo">
                <a
                  href={`mailto:${repair.customer_email}`}
                  className="text-brand-blue inline-flex items-center gap-1 break-all hover:underline"
                >
                  <Mail className="size-3.5" aria-hidden="true" /> {repair.customer_email}
                </a>
              </Detail>
            ) : null}
          </dl>
        </section>
      </div>
    </>
  );
}
