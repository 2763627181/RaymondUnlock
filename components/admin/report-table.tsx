import { RequestStatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isRequestStatus } from "@/lib/admin/status";
import { displayValue } from "@/lib/reports/cell";
import type { ReportColumn, ReportTable } from "@/lib/reports/types";

const isNumeric = (column: ReportColumn) => column.kind === "money" || column.kind === "integer";

/** Una tabla de informe en pantalla: la misma que se descarga en Excel y PDF. */
export function ReportTableView({ table }: { table: ReportTable }) {
  const { totals } = table;
  if (table.rows.length === 0) {
    return (
      <p className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        {table.emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {table.columns.map((column) => (
            <TableHead key={column.key} className={isNumeric(column) ? "text-right" : undefined}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.rows.map((row, index) => (
          <TableRow key={index}>
            {table.columns.map((column) => {
              const value = row[column.key] ?? null;
              return (
                <TableCell
                  key={column.key}
                  className={isNumeric(column) ? "tabular-nums-price text-right" : undefined}
                >
                  {column.kind === "status" &&
                  typeof value === "string" &&
                  isRequestStatus(value) ? (
                    <RequestStatusBadge status={value} />
                  ) : (
                    displayValue(column, value)
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
        {totals ? (
          <TableRow className="bg-brand-red-600/5 font-semibold">
            {table.columns.map((column, index) => (
              <TableCell
                key={column.key}
                className={isNumeric(column) ? "tabular-nums-price text-right" : undefined}
              >
                {index === 0
                  ? (table.totalsLabel ?? "Total")
                  : column.key in totals
                    ? displayValue(column, totals[column.key] ?? null)
                    : ""}
              </TableCell>
            ))}
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
