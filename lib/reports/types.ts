/**
 * Un informe es datos ya listos para mostrar, sin saber de Excel ni de PDF:
 * los constructores (`quotes-report.ts`, `repairs-report.ts`, `sales-report.ts`)
 * lo arman desde la base y los dos formatos (`excel.ts`, `pdf-document.tsx`) lo
 * dibujan igual, así que un cambio de contenido sale en ambos.
 */

export type ColumnKind = "text" | "money" | "integer" | "datetime" | "status";

export interface ReportColumn {
  key: string;
  label: string;
  kind: ColumnKind;
  /** Ancho relativo: caracteres en Excel, peso de la columna en el PDF. */
  width: number;
  /** El texto largo salta de línea en vez de cortarse. */
  wrap?: boolean;
}

export type ReportValue = string | number | Date | null;
export type ReportRow = Record<string, ReportValue>;

export interface ReportTable {
  /** Título de la sección en el PDF y nombre de la hoja en Excel. */
  title: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Suma por columna (money o integer); la etiqueta va en la primera columna. */
  totals?: Record<string, number>;
  /** Etiqueta de la fila de totales; "Total" si no se indica. */
  totalsLabel?: string;
  emptyMessage: string;
}

export interface ReportKpi {
  label: string;
  value: string;
  /** Línea pequeña bajo el valor (una comparación, un porcentaje). */
  hint?: string;
}

export interface ReportBusiness {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
}

export interface Report {
  /** Nombre del archivo sin extensión. */
  filename: string;
  title: string;
  subtitle: string;
  generatedAt: Date;
  business: ReportBusiness;
  kpis: ReportKpi[];
  tables: ReportTable[];
}
