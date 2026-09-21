import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExportButtons } from "@/components/admin/export-buttons";
import { KpiCards } from "@/components/admin/kpi-cards";
import { PageHeader } from "@/components/admin/page-header";
import { ReportTableView } from "@/components/admin/report-table";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { currentMonth, monthLabel, parseMonth, shiftMonth } from "@/lib/reports/month";
import { loadSalesReport } from "@/lib/reports/queries";

export const metadata: Metadata = { title: "Ventas" };

export default async function AdminSalesPage(props: PageProps<"/admin/ventas">) {
  await requireAdmin("/admin/ventas");
  const { mes } = await props.searchParams;
  const month = parseMonth(Array.isArray(mes) ? mes[0] : mes);
  const report = await loadSalesReport(month);
  const [sales, products] = report.tables;

  const latest = currentMonth();
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);

  return (
    <>
      <PageHeader
        title="Ventas del mes"
        description="Las cotizaciones que marcaste como “Cerrada”, contadas en el mes en que las cerraste."
        actions={<ExportButtons path="/admin/ventas/export" params={{ mes: month }} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href={`/admin/ventas?mes=${previous}`} aria-label={`Ver ${monthLabel(previous)}`}>
            <ChevronLeft aria-hidden="true" />
          </Link>
        </Button>
        <p className="min-w-40 text-center text-lg font-semibold" aria-live="polite">
          {monthLabel(month)}
        </p>
        {month < latest ? (
          <Button asChild variant="outline" size="icon">
            <Link href={`/admin/ventas?mes=${next}`} aria-label={`Ver ${monthLabel(next)}`}>
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="icon" disabled aria-label="No hay meses posteriores">
            <ChevronRight aria-hidden="true" />
          </Button>
        )}

        <form action="/admin/ventas" method="get" className="ml-auto flex items-center gap-2">
          <label htmlFor="mes" className="sr-only">
            Elegir mes
          </label>
          <input
            id="mes"
            type="month"
            name="mes"
            defaultValue={month}
            max={latest}
            pattern="\d{4}-\d{2}"
            className="border-input bg-surface focus-visible:ring-ring h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
          />
          <Button type="submit" variant="outline" className="h-10">
            Ver mes
          </Button>
        </form>
      </div>

      <KpiCards kpis={report.kpis} />

      {sales ? (
        <section className="mt-8" aria-labelledby="ventas-titulo">
          <h2 id="ventas-titulo" className="mb-3 text-lg font-semibold">
            Ventas
          </h2>
          <ReportTableView table={sales} />
        </section>
      ) : null}

      {products && sales && sales.rows.length > 0 ? (
        <section className="mt-10" aria-labelledby="productos-titulo">
          <h2 id="productos-titulo" className="mb-3 text-lg font-semibold">
            Productos vendidos
          </h2>
          <ReportTableView table={products} />
        </section>
      ) : null}
    </>
  );
}
