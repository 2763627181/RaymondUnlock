import type { ReportKpi } from "@/lib/reports/types";

/** Los indicadores de un informe como tarjetas (los mismos que salen en el Excel y el PDF). */
export function KpiCards({ kpis }: { kpis: ReportKpi[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-surface border-border border-l-brand-red-600 min-w-0 rounded-xl border border-l-4 p-4"
        >
          <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {kpi.label}
          </dt>
          <dd className="tabular-nums-price mt-1 text-2xl font-semibold break-words">
            {kpi.value}
          </dd>
          {kpi.hint ? <p className="text-success-700 mt-1 text-xs">{kpi.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}
