import "server-only";
import type { PricedLine } from "@/lib/cart/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Enums } from "@/types/database";

/**
 * Las solicitudes públicas se insertan solo desde el servidor con service_role,
 * después de validar con Zod y volver a calcular los precios: anon y
 * authenticated no tienen permiso de insertar en estas tablas.
 */

async function nextRequestCode(prefix: "RU" | "RE"): Promise<string> {
  const { data, error } = await createAdminClient().rpc("next_request_code", {
    p_prefix: prefix,
  });
  if (error) throw new Error(`No se pudo generar el código ${prefix}: ${error.message}`);
  return data;
}

export interface NewQuote {
  customerName: string;
  customerPhone: string;
  customerEmail: string | undefined;
  note: string | undefined;
  channel: Enums<"quote_channel">;
  subtotal: number;
  lines: PricedLine[];
}

/** Guarda la cotización con sus líneas y devuelve su código (RU-2026-0001). */
export async function createQuote(quote: NewQuote): Promise<string> {
  const supabase = createAdminClient();
  const code = await nextRequestCode("RU");

  const { data: header, error } = await supabase
    .from("quotes")
    .insert({
      code,
      customer_name: quote.customerName,
      customer_phone: quote.customerPhone,
      customer_email: quote.customerEmail ?? null,
      note: quote.note ?? null,
      channel: quote.channel,
      subtotal: quote.subtotal,
    })
    .select("id")
    .single();
  if (error) throw new Error(`No se pudo guardar la cotización ${code}: ${error.message}`);

  const { error: itemsError } = await supabase.from("quote_items").insert(
    quote.lines.map((line) => ({
      quote_id: header.id,
      variant_id: line.variantId,
      product_name: line.productName,
      // El código va en la etiqueta para que el admin lo vea (y lo busque) aunque la variante se borre.
      variant_label: [line.variantLabel, line.code].filter(Boolean).join(" · ") || null,
      unit_price: line.unitPrice,
      quantity: line.quantity,
      line_total: line.lineTotal,
    })),
  );
  if (itemsError) {
    // PostgREST no abre transacciones entre tablas: se deshace la cabecera para
    // no dejar en el admin una cotización sin productos.
    await supabase.from("quotes").delete().eq("id", header.id);
    throw new Error(`No se pudieron guardar las líneas de ${code}: ${itemsError.message}`);
  }

  return code;
}

export interface NewRepairRequest {
  customerName: string;
  customerPhone: string;
  customerEmail: string | undefined;
  device: string;
  serviceId: string;
  issueDescription: string;
}

/** Guarda la solicitud de reparación y devuelve su código (RE-2026-0001). */
export async function createRepairRequest(request: NewRepairRequest): Promise<string> {
  const code = await nextRequestCode("RE");

  const { error } = await createAdminClient()
    .from("repair_requests")
    .insert({
      code,
      customer_name: request.customerName,
      customer_phone: request.customerPhone,
      customer_email: request.customerEmail ?? null,
      device: request.device,
      service_id: request.serviceId,
      issue_description: request.issueDescription,
    });
  if (error) throw new Error(`No se pudo guardar la solicitud ${code}: ${error.message}`);

  return code;
}
