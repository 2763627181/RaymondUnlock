import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { WholesaleActions, type WholesaleState } from "@/components/admin/wholesale-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/admin/format-date";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mayoristas" };

const TABS: { value: WholesaleState; label: string }[] = [
  { value: "pendiente", label: "Pendientes" },
  { value: "aprobada", label: "Aprobadas" },
  { value: "rechazada", label: "Rechazadas" },
];

export default async function AdminWholesalePage(props: PageProps<"/admin/mayoristas">) {
  await requireAdmin("/admin/mayoristas");
  const { estado } = await props.searchParams;
  const requested = Array.isArray(estado) ? estado[0] : estado;
  const state: WholesaleState = TABS.find((tab) => tab.value === requested)?.value ?? "pendiente";

  const supabase = await createSessionClient();
  let query = supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, business_name, rnc, estimated_volume, created_at, wholesale_reviewed_at",
    );
  if (state === "pendiente") query = query.eq("role", "wholesale").eq("wholesale_approved", false);
  else if (state === "aprobada")
    query = query.eq("role", "wholesale").eq("wholesale_approved", true);
  else query = query.eq("role", "customer").not("wholesale_reviewed_at", "is", null);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="Cuentas al por mayor"
        description="Aprueba o rechaza las solicitudes. Al decidir, la persona recibe un correo de aviso."
      />

      <nav aria-label="Estado de las solicitudes" className="mb-4 flex gap-1">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/mayoristas?estado=${tab.value}`}
            aria-current={tab.value === state ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              tab.value === state
                ? "bg-ink text-surface"
                : "text-muted-foreground hover:bg-surface",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {data && data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Solicitante</TableHead>
              <TableHead>Negocio</TableHead>
              <TableHead>Volumen</TableHead>
              <TableHead>Solicitada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((person) => (
              <TableRow key={person.id}>
                <TableCell>
                  <p className="font-medium">{person.full_name ?? "Sin nombre"}</p>
                  <p className="text-muted-foreground text-xs">{person.email}</p>
                  {person.phone ? (
                    <p className="text-muted-foreground text-xs">{person.phone}</p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <p>{person.business_name ?? "—"}</p>
                  {person.rnc ? (
                    <p className="text-muted-foreground text-xs">RNC {person.rnc}</p>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-48">{person.estimated_volume ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(person.created_at)}
                </TableCell>
                <TableCell>
                  <WholesaleActions
                    userId={person.id}
                    name={person.full_name ?? person.email ?? "esta cuenta"}
                    state={state}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          No hay solicitudes en este estado.
        </p>
      )}
    </>
  );
}
