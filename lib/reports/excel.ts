import ExcelJS from "exceljs";
import { formatDateTime } from "@/lib/admin/format-date";
import { statusLabel } from "@/lib/reports/cell";
import { toExcelWallClock } from "@/lib/reports/month";
import { BRAND, statusColors } from "@/lib/reports/theme";
import type { Report, ReportColumn, ReportRow, ReportTable } from "@/lib/reports/types";

const MONEY_FORMAT = '"RD$" #,##0.00';
const INTEGER_FORMAT = "#,##0";
const DATETIME_FORMAT = "dd/mm/yyyy hh:mm";
const FONT = "Calibri";

const argb = (hex: string) => `FF${hex}`;
const solid = (hex: string): ExcelJS.Fill => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: argb(hex) },
});
const line = (style: ExcelJS.BorderStyle, hex: string): Partial<ExcelJS.Border> => ({
  style,
  color: { argb: argb(hex) },
});
const font = (size: number, hex: string, bold = false): Partial<ExcelJS.Font> => ({
  name: FONT,
  size,
  bold,
  color: { argb: argb(hex) },
});

const isNumeric = (column: ReportColumn) => column.kind === "money" || column.kind === "integer";

function sheetName(title: string, taken: Set<string>): string {
  const base =
    title
      .replace(/[[\]:*?/\\]/g, " ")
      .trim()
      .slice(0, 28) || "Hoja";
  let name = base;
  for (let n = 2; taken.has(name); n += 1) name = `${base} ${n}`;
  taken.add(name);
  return name;
}

function cellValue(column: ReportColumn, value: ReportRow[string] | undefined) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return toExcelWallClock(value);
  if (column.kind === "status" && typeof value === "string") return statusLabel(value);
  return value;
}

/** Alto de fila estimado: Excel no ajusta solo el de las celdas con salto de línea. */
function rowHeight(columns: ReportColumn[], row: ReportRow): number | undefined {
  const lines = columns.reduce((max, column) => {
    const value = row[column.key];
    if (!column.wrap || typeof value !== "string") return max;
    return Math.max(max, Math.ceil(value.length / (column.width * 1.05)));
  }, 1);
  return lines > 1 ? lines * 13.5 + 8 : undefined;
}

function addSheet(
  workbook: ExcelJS.Workbook,
  report: Report,
  table: ReportTable,
  first: boolean,
  taken: Set<string>,
) {
  const { columns } = table;
  const width = columns.length;
  const sheet = workbook.addWorksheet(sheetName(table.title, taken), {
    properties: { tabColor: { argb: argb(BRAND.red) } },
    views: [{ showGridLines: false }],
  });
  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });

  let row = 1;
  /** Una fila que ocupa todo el ancho, con fondo opcional. */
  const fullRow = (height: number, background?: string) => {
    if (background)
      for (let c = 1; c <= width; c += 1) sheet.getCell(row, c).fill = solid(background);
    sheet.mergeCells(row, 1, row, width);
    sheet.getRow(row).height = height;
    return sheet.getCell(row, 1);
  };

  // Franja de la marca
  const [firstWord = "", ...rest] = report.business.name.split(" ");
  const band = fullRow(40, BRAND.ink);
  band.value = {
    richText: [
      { text: firstWord, font: font(20, BRAND.white, true) },
      { text: rest.length > 0 ? ` ${rest.join(" ")}` : "", font: font(20, BRAND.red, true) },
      { text: `    ${report.business.tagline}`, font: font(10, BRAND.onInkMuted) },
    ],
  };
  band.alignment = { vertical: "middle", indent: 1 };
  row += 1;
  fullRow(5, BRAND.red);
  row += 1;

  const title = fullRow(32);
  title.value = first ? report.title : `${report.title} · ${table.title}`;
  title.font = font(18, BRAND.ink, true);
  title.alignment = { vertical: "middle", indent: 1 };
  row += 1;
  const subtitle = fullRow(20);
  subtitle.value = report.subtitle;
  subtitle.font = font(11, BRAND.ink700);
  subtitle.alignment = { vertical: "middle", indent: 1 };
  row += 1;
  const generated = fullRow(18);
  generated.value = `Generado el ${formatDateTime(report.generatedAt.toISOString())} · ${report.business.phone} · ${report.business.email}`;
  generated.font = font(9, BRAND.muted);
  generated.alignment = { vertical: "middle", indent: 1 };
  row += 1;
  fullRow(10);
  row += 1;

  // Tarjetas de indicadores (solo en la primera hoja)
  if (first && report.kpis.length > 0) {
    // Las columnas se reparten parejo entre las tarjetas; las que sobran, a las primeras.
    const base = Math.floor(width / report.kpis.length);
    const extra = width % report.kpis.length;
    let next = 1;
    const heights = [18, 30, 18];
    report.kpis.forEach((kpi, index) => {
      const from = next;
      const to = from + Math.max(1, base + (index < extra ? 1 : 0)) - 1;
      next = to + 1;
      const parts = [
        { text: kpi.label.toUpperCase(), style: font(8, BRAND.muted, true) },
        { text: kpi.value, style: font(18, BRAND.ink, true) },
        { text: kpi.hint ?? "", style: font(9, BRAND.success) },
      ];
      parts.forEach((part, offset) => {
        const r = row + offset;
        for (let c = from; c <= to; c += 1) {
          sheet.getCell(r, c).fill = solid(BRAND.surface2);
          sheet.getCell(r, c).border = {
            ...(c === from ? { left: line("thick", BRAND.red) } : {}),
            ...(c === to ? { right: line("thick", BRAND.white) } : {}),
          };
        }
        sheet.mergeCells(r, from, r, to);
        const cell = sheet.getCell(r, from);
        cell.value = part.text;
        cell.font = part.style;
        cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
        sheet.getRow(r).height = heights[offset] ?? 18;
      });
    });
    row += 3;
    fullRow(12);
    row += 1;
  }

  // Título de la tabla y encabezados
  const section = fullRow(26);
  section.value = table.title;
  section.font = font(13, BRAND.ink, true);
  section.alignment = { vertical: "middle", indent: 1 };
  row += 1;

  const headerRow = row;
  columns.forEach((column, index) => {
    const cell = sheet.getCell(headerRow, index + 1);
    cell.value = column.label;
    cell.font = font(10, BRAND.white, true);
    cell.fill = solid(BRAND.ink);
    cell.border = { bottom: line("medium", BRAND.red) };
    cell.alignment = {
      vertical: "middle",
      wrapText: true,
      horizontal: isNumeric(column) ? "right" : column.kind === "status" ? "center" : "left",
      indent: isNumeric(column) ? 0 : 1,
    };
  });
  sheet.getRow(headerRow).height = 26;
  row += 1;

  if (table.rows.length === 0) {
    const empty = fullRow(44);
    empty.value = table.emptyMessage;
    empty.font = { ...font(11, BRAND.muted), italic: true };
    empty.alignment = { vertical: "middle", horizontal: "center" };
    row += 1;
  }

  table.rows.forEach((data, index) => {
    columns.forEach((column, c) => {
      const cell = sheet.getCell(row, c + 1);
      cell.value = cellValue(column, data[column.key]);
      cell.font = font(10, BRAND.ink);
      cell.border = { bottom: line("thin", BRAND.border) };
      if (index % 2 === 1) cell.fill = solid(BRAND.surface2);
      cell.alignment = {
        vertical: "middle",
        wrapText: column.wrap === true,
        horizontal: isNumeric(column) ? "right" : column.kind === "status" ? "center" : "left",
        indent: isNumeric(column) ? 0 : 1,
      };
      if (column.kind === "money") cell.numFmt = MONEY_FORMAT;
      if (column.kind === "integer") cell.numFmt = INTEGER_FORMAT;
      if (column.kind === "datetime") cell.numFmt = DATETIME_FORMAT;
      if (column.kind === "status" && typeof data[column.key] === "string") {
        const colors = statusColors(String(data[column.key]));
        cell.fill = solid(colors.bg);
        cell.font = font(9, colors.fg, true);
      }
    });
    const height = rowHeight(columns, data);
    sheet.getRow(row).height = height ?? 22;
    row += 1;
  });

  if (table.totals && table.rows.length > 0) {
    columns.forEach((column, c) => {
      const cell = sheet.getCell(row, c + 1);
      const total = table.totals?.[column.key];
      cell.value = c === 0 ? (table.totalsLabel ?? "Total") : (total ?? null);
      cell.font = font(11, BRAND.ink, true);
      cell.fill = solid(BRAND.redTint);
      cell.border = { top: line("medium", BRAND.ink), bottom: line("thin", BRAND.border) };
      cell.alignment = {
        vertical: "middle",
        horizontal: isNumeric(column) ? "right" : "left",
        indent: isNumeric(column) ? 0 : 1,
      };
      if (column.kind === "money") cell.numFmt = MONEY_FORMAT;
      if (column.kind === "integer") cell.numFmt = INTEGER_FORMAT;
    });
    sheet.getRow(row).height = 26;
  }

  sheet.views = [{ state: "frozen", ySplit: headerRow, showGridLines: false }];
  if (table.rows.length > 0) {
    sheet.autoFilter = {
      from: { row: headerRow, column: 1 },
      to: { row: headerRow, column: width },
    };
  }
  sheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.3, footer: 0.3 },
    printTitlesRow: `${headerRow}:${headerRow}`,
  };
  sheet.headerFooter = {
    oddFooter: `&L&8${report.business.name.replace(/&/g, "&&")}&R&8Página &P de &N`,
  };
}

/** Libro de Excel del informe: una hoja por tabla, con la marca, filtros y listo para imprimir. */
export async function buildWorkbook(report: Report): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = report.business.name;
  workbook.title = report.title;
  workbook.created = report.generatedAt;

  const taken = new Set<string>();
  report.tables.forEach((table, index) => addSheet(workbook, report, table, index === 0, taken));
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
