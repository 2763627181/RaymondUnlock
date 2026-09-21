import { NextResponse, type NextRequest } from "next/server";
import { toCsv } from "@/lib/admin/csv";
import { parseRequestFilters, searchClause } from "@/lib/admin/quotes-query";
import { REQUEST_STATUS_LABELS } from "@/lib/admin/status";
import { getViewer } from "@/lib/auth/viewer";
import { createSessionClient } from "@/lib/supabase/server";

const MAX_ROWS = 5000;

const HEADERS = [
  "Código",
  "Fecha",
  "Estado",
  "Cliente",
  "Teléfono",
  "Correo",
  "Canal",
  "Nota",
  "Producto",
  "Variante",
  "Cantidad",
  "Precio unitario",
  "Total línea",
  "Subtotal cotización",
];

/** CSV de cotizaciones (una fila por artículo) con los mismos filtros del listado. */
export async function GET(request: NextRequest) {
  // El proxy solo comprueba la sesión: aquí se exige el rol admin.
  const viewer = await getViewer();
  if (!viewer || !viewer.isAdmin) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const filters = parseRequestFilters(Object.fromEntries(request.nextUrl.searchParams));
  const supabase = await createSessionClient();

  let query = supabase
    .from("quotes")
    .select("*, quote_items(product_name, variant_label, quantity, unit_price, line_total)");
  if (filters.status) query = query.eq("status", filters.status);
  const clause = searchClause(filters.q, [
    "code",
    "customer_name",
    "customer_phone",
    "customer_email",
  ]);
  if (clause) query = query.or(clause);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(MAX_ROWS);
  if (error) return new NextResponse("No se pudo generar el archivo", { status: 500 });

  const rows = data.flatMap((quote) => {
    const base = [
      quote.code,
      quote.created_at,
      REQUEST_STATUS_LABELS[quote.status],
      quote.customer_name,
      quote.customer_phone,
      quote.customer_email,
      quote.channel,
      quote.note,
    ];
    const lines = quote.quote_items.length > 0 ? quote.quote_items : [null];
    return lines.map((item) => [
      ...base,
      item?.product_name,
      item?.variant_label,
      item?.quantity,
      item?.unit_price,
      item?.line_total,
      quote.subtotal,
    ]);
  });

  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cotizaciones-${day}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
