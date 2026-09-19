import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileText, Hammer, Package, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { RequestStatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/admin/format-date";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/inventory";
import { getAdminCounts } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Panel" };

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");
  const supabase = await createSessionClient();
  const head = { count: "exact", head: true } as const;

  const [counts, activeProducts, lowStock, latest] = await Promise.all([
    getAdminCounts(),
    supabase.from("products").select("id", head).eq("is_active", true),
    // product_variants está cerrada a la API: solo el servidor la lee, tras requireAdmin().
    createAdminClient()
      .from("product_variants")
      .select("id", head)
      .eq("is_active", true)
      .lte("stock", LOW_STOCK_THRESHOLD),
    supabase
      .from("quotes")
      .select("id, code, customer_name, tier, status, subtotal, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const cards = [
    {
      href: "/admin/cotizaciones?estado=nueva",
      label: "Cotizaciones nuevas",
      value: counts.quotes,
      icon: FileText,
    },
    {
      href: "/admin/reparaciones?estado=nueva",
      label: "Reparaciones pendientes",
      value: counts.repairs,
      icon: Hammer,
    },
    {
      href: "/admin/productos?estado=activo",
      label: "Productos activos",
      value: activeProducts.count ?? 0,
      icon: Package,
    },
    {
      href: "/admin/productos?stock=bajo",
      label: "Variantes con poco stock",
      value: lowStock.count ?? 0,
      icon: AlertTriangle,
    },
    {
      href: "/admin/mayoristas",
      label: "Solicitudes mayoristas",
      value: counts.wholesale,
      icon: Users,
    },
  ];

  return (
    <>
      <PageHeader title="Panel" description="Lo que necesita tu atención hoy." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, value, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="border-border bg-surface hover:bg-surface-2/60 focus-visible:ring-ring flex items-center gap-4 rounded-xl border p-5 outline-none focus-visible:ring-2"
          >
            <span className="bg-surface-2 flex size-11 shrink-0 items-center justify-center rounded-full">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="tabular-nums-price block text-2xl font-semibold">{value}</span>
              <span className="text-muted-foreground text-sm">{label}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10" aria-labelledby="ultimas">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="ultimas" className="text-lg font-semibold">
            Últimas cotizaciones
          </h2>
          <Link href="/admin/cotizaciones" className="text-brand-blue text-sm hover:underline">
            Ver todas
          </Link>
        </div>
        {latest.data && latest.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latest.data.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <Link
                      href={`/admin/cotizaciones/${quote.id}`}
                      className="text-brand-blue font-medium hover:underline"
                    >
                      {quote.code}
                    </Link>
                  </TableCell>
                  <TableCell>{quote.customer_name}</TableCell>
                  <TableCell>{quote.tier === "wholesale" ? "Por mayor" : "Unidad"}</TableCell>
                  <TableCell className="tabular-nums-price text-right">
                    {formatPrice(quote.subtotal)}
                  </TableCell>
                  <TableCell>
                    <RequestStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(quote.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            Aún no hay cotizaciones. Cuando un cliente envíe una, aparece aquí.
          </p>
        )}
      </section>
    </>
  );
}
