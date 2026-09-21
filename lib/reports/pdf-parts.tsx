import { Text, View } from "@react-pdf/renderer";
import { displayValue, statusLabel } from "@/lib/reports/cell";
import { BRAND, statusColors } from "@/lib/reports/theme";
import type { ColumnKind, Report, ReportColumn, ReportRow, ReportTable } from "@/lib/reports/types";
import { formatDateTime } from "@/lib/admin/format-date";

const hex = (color: string) => `#${color}`;
const BOLD = "Helvetica-Bold";

const isNumeric = (column: ReportColumn) => column.kind === "money" || column.kind === "integer";

/** En el PDF las fechas y los montos no deben partirse en dos líneas: ancho mínimo por tipo. */
const MIN_WEIGHT: Record<ColumnKind, number> = {
  money: 21,
  datetime: 20,
  status: 13,
  integer: 9,
  text: 0,
};
const weight = (column: ReportColumn) => Math.max(column.width, MIN_WEIGHT[column.kind]);

/** Franja negra de la marca con la raya roja debajo. */
export function Band({ report }: { report: Report }) {
  const [first = "", ...rest] = report.business.name.split(" ");
  return (
    <View>
      <View
        style={{
          backgroundColor: hex(BRAND.ink),
          paddingHorizontal: 28,
          paddingVertical: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: BOLD, fontSize: 20, color: hex(BRAND.white) }}>
          {first}
          <Text style={{ color: hex(BRAND.red) }}>
            {rest.length > 0 ? ` ${rest.join(" ")}` : ""}
          </Text>
        </Text>
        <Text style={{ fontSize: 9, color: hex(BRAND.onInkMuted) }}>{report.business.tagline}</Text>
      </View>
      <View style={{ height: 4, backgroundColor: hex(BRAND.red) }} />
    </View>
  );
}

export function TitleBlock({ report }: { report: Report }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontFamily: BOLD, fontSize: 20 }}>{report.title}</Text>
      <Text style={{ fontSize: 10.5, color: hex(BRAND.ink700), marginTop: 3 }}>
        {report.subtitle}
      </Text>
      <Text style={{ fontSize: 7.5, color: hex(BRAND.muted), marginTop: 3 }}>
        Generado el {formatDateTime(report.generatedAt.toISOString())}
        {"  ·  "}
        {report.business.address}
      </Text>
    </View>
  );
}

export function Kpis({ report }: { report: Report }) {
  if (report.kpis.length === 0) return null;
  return (
    <View style={{ flexDirection: "row", marginBottom: 16 }}>
      {report.kpis.map((kpi, index) => (
        <View
          key={kpi.label}
          style={{
            flex: 1,
            backgroundColor: hex(BRAND.surface2),
            borderLeftWidth: 3,
            borderLeftColor: hex(BRAND.red),
            paddingVertical: 9,
            paddingHorizontal: 12,
            marginRight: index === report.kpis.length - 1 ? 0 : 8,
          }}
        >
          <Text style={{ fontFamily: BOLD, fontSize: 7, color: hex(BRAND.muted) }}>
            {kpi.label.toUpperCase()}
          </Text>
          <Text style={{ fontFamily: BOLD, fontSize: 15, marginTop: 3 }}>{kpi.value}</Text>
          <Text style={{ fontSize: 7.5, color: hex(BRAND.success), marginTop: 2 }}>
            {kpi.hint ?? " "}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Cell({
  column,
  row,
  pct,
  bold = false,
  blank = false,
}: {
  column: ReportColumn;
  row: ReportRow;
  pct: number;
  bold?: boolean;
  /** Sin valor no se escribe la raya (la fila de totales deja vacías sus celdas). */
  blank?: boolean;
}) {
  const value = row[column.key] ?? null;
  const style = { width: `${pct}%`, paddingHorizontal: 5 } as const;

  if (column.kind === "status" && typeof value === "string") {
    const colors = statusColors(value);
    return (
      <View style={style}>
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: hex(colors.bg),
            borderRadius: 8,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontFamily: BOLD, fontSize: 7, color: hex(colors.fg) }}>
            {statusLabel(value)}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={style}>
      <Text
        style={{
          fontFamily: bold ? BOLD : "Helvetica",
          textAlign: isNumeric(column) ? "right" : "left",
        }}
      >
        {blank && value === null ? "" : displayValue(column, value)}
      </Text>
    </View>
  );
}

/** Fila de totales: la etiqueta ocupa el ancho de las columnas vacías que la preceden, para no partirse. */
function TotalsRow({ table, pct }: { table: ReportTable; pct: (column: ReportColumn) => number }) {
  const totals = table.totals ?? {};
  const firstTotal = table.columns.findIndex((column) => column.key in totals);
  const labelSpan = Math.max(1, firstTotal);
  const labelWidth = table.columns
    .slice(0, labelSpan)
    .reduce((sum, column) => sum + pct(column), 0);

  return (
    <View
      wrap={false}
      style={{
        flexDirection: "row",
        paddingVertical: 7,
        backgroundColor: hex(BRAND.redTint),
        borderTopWidth: 1.5,
        borderTopColor: hex(BRAND.ink),
      }}
    >
      <View style={{ width: `${labelWidth}%`, paddingHorizontal: 5 }}>
        <Text style={{ fontFamily: BOLD }}>{table.totalsLabel ?? "Total"}</Text>
      </View>
      {table.columns.slice(labelSpan).map((column) => (
        <Cell
          key={column.key}
          column={column}
          pct={pct(column)}
          bold
          blank
          row={{ [column.key]: totals[column.key] ?? null }}
        />
      ))}
    </View>
  );
}

export function TableView({ table }: { table: ReportTable }) {
  const total = table.columns.reduce((sum, column) => sum + weight(column), 0);
  const pct = (column: ReportColumn) => (weight(column) / total) * 100;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
        <View style={{ width: 4, height: 14, backgroundColor: hex(BRAND.red), marginRight: 7 }} />
        <Text style={{ fontFamily: BOLD, fontSize: 13 }}>{table.title}</Text>
      </View>

      <View
        fixed
        style={{
          flexDirection: "row",
          backgroundColor: hex(BRAND.ink),
          borderBottomWidth: 2,
          borderBottomColor: hex(BRAND.red),
          paddingVertical: 7,
        }}
      >
        {table.columns.map((column) => (
          <View key={column.key} style={{ width: `${pct(column)}%`, paddingHorizontal: 5 }}>
            <Text
              style={{
                fontFamily: BOLD,
                fontSize: 7.5,
                color: hex(BRAND.white),
                textAlign: isNumeric(column) ? "right" : "left",
              }}
            >
              {column.label}
            </Text>
          </View>
        ))}
      </View>

      {table.rows.length === 0 ? (
        <View style={{ paddingVertical: 26, alignItems: "center" }}>
          <Text style={{ fontSize: 10, color: hex(BRAND.muted) }}>{table.emptyMessage}</Text>
        </View>
      ) : (
        table.rows.map((row, index) => (
          <View
            key={index}
            wrap={false}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 5,
              backgroundColor: hex(index % 2 === 1 ? BRAND.surface2 : BRAND.white),
              borderBottomWidth: 0.5,
              borderBottomColor: hex(BRAND.border),
            }}
          >
            {table.columns.map((column) => (
              <Cell key={column.key} column={column} row={row} pct={pct(column)} />
            ))}
          </View>
        ))
      )}

      {table.totals && table.rows.length > 0 ? <TotalsRow table={table} pct={pct} /> : null}
    </View>
  );
}
