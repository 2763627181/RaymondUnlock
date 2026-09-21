import { formatDateTime } from "@/lib/admin/format-date";
import type { HistoryEntry } from "@/lib/admin/product-history";

/** Historial de modificaciones del producto y de sus variantes, de la más reciente a la más antigua. */
export function ProductHistoryPanel({ entries }: { entries: HistoryEntry[] }) {
  return (
    <section aria-labelledby="historial-titulo" className="space-y-4">
      <div>
        <h2 id="historial-titulo" className="text-lg font-semibold">
          Historial de cambios
        </h2>
        <p className="text-muted-foreground text-[13px]">
          Cada vez que se guarda algo distinto queda aquí, con el valor de antes y el de después.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
          Aún no hay cambios registrados. Desde ahora, cada modificación aparecerá aquí.
        </p>
      ) : (
        <ol className="border-border bg-surface divide-border divide-y rounded-xl border">
          {entries.map((entry) => (
            <li key={entry.id} className="space-y-1.5 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium">{entry.title}</p>
                <time dateTime={entry.at} className="text-muted-foreground text-xs">
                  {formatDateTime(entry.at)}
                </time>
              </div>
              {entry.changes.length > 0 ? (
                <ul className="text-muted-foreground space-y-0.5 text-[13px]">
                  {entry.changes.map((change) => (
                    <li key={change.label}>
                      <span className="text-foreground">{change.label}:</span> {change.before} →{" "}
                      <span className="text-foreground font-medium">{change.after}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
