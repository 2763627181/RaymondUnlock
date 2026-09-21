import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Descargas del informe en Excel y en PDF, con los mismos filtros que tiene puestos el listado. */
export function ExportButtons({
  path,
  params = {},
}: {
  /** Ruta de la descarga, por ejemplo "/admin/cotizaciones/export". */
  path: string;
  params?: Record<string, string>;
}) {
  const href = (formato: "xlsx" | "pdf") => {
    const query = new URLSearchParams({
      ...Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "")),
      formato,
    });
    return `${path}?${query.toString()}`;
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Exportar">
      <Button asChild variant="outline" className="h-10">
        <a href={href("xlsx")} download>
          <FileSpreadsheet aria-hidden="true" /> Excel
        </a>
      </Button>
      <Button asChild variant="outline" className="h-10">
        <a href={href("pdf")} download>
          <FileText aria-hidden="true" /> PDF
        </a>
      </Button>
    </div>
  );
}
