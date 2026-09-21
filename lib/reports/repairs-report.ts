import { dateStamp } from "@/lib/reports/month";
import type { Report, ReportBusiness, ReportColumn } from "@/lib/reports/types";

export interface RepairExportRow {
  code: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  device: string;
  issue_description: string;
  status: string;
  service: { name: string } | null;
}

const COLUMNS: ReportColumn[] = [
  { key: "date", label: "Fecha", kind: "datetime", width: 19 },
  { key: "code", label: "Código", kind: "text", width: 15 },
  { key: "customer", label: "Cliente", kind: "text", width: 24 },
  { key: "phone", label: "Teléfono", kind: "text", width: 15 },
  { key: "email", label: "Correo", kind: "text", width: 28 },
  { key: "device", label: "Equipo", kind: "text", width: 22, wrap: true },
  { key: "service", label: "Servicio", kind: "text", width: 24, wrap: true },
  { key: "issue", label: "Problema descrito", kind: "text", width: 44, wrap: true },
  { key: "status", label: "Estado", kind: "status", width: 13 },
];

export function buildRepairsReport(input: {
  repairs: RepairExportRow[];
  filterDescription: string;
  truncated: boolean;
  business: ReportBusiness;
  generatedAt: Date;
}): Report {
  const { repairs } = input;
  const count = (...statuses: string[]) =>
    repairs.filter((repair) => statuses.includes(repair.status)).length;
  const fresh = count("nueva");
  const inProgress = count("contactada", "cotizada");
  const closed = count("cerrada");
  const cancelled = count("cancelada");

  return {
    filename: `reparaciones-${dateStamp(input.generatedAt)}`,
    title: "Informe de reparaciones",
    subtitle: input.truncated
      ? `${input.filterDescription} · se muestran las primeras ${repairs.length}`
      : input.filterDescription,
    generatedAt: input.generatedAt,
    business: input.business,
    kpis: [
      { label: "Solicitudes", value: repairs.length.toLocaleString("es-DO") },
      { label: "Por atender", value: fresh.toLocaleString("es-DO"), hint: "Estado: nueva" },
      {
        label: "En seguimiento",
        value: inProgress.toLocaleString("es-DO"),
        hint: "Contactadas y cotizadas",
      },
      {
        label: "Cerradas",
        value: closed.toLocaleString("es-DO"),
        hint: `${cancelled} canceladas`,
      },
    ],
    tables: [
      {
        title: "Reparaciones",
        columns: COLUMNS,
        rows: repairs.map((repair) => ({
          date: new Date(repair.created_at),
          code: repair.code,
          customer: repair.customer_name,
          phone: repair.customer_phone,
          email: repair.customer_email,
          device: repair.device,
          service: repair.service?.name ?? null,
          issue: repair.issue_description,
          status: repair.status,
        })),
        emptyMessage: "No hay reparaciones con estos filtros.",
      },
    ],
  };
}
