import "server-only";
import type { VariantPricingRow } from "@/lib/cart/pricing";
import { variantLabel } from "@/lib/catalog/cards";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Filas de precios para volver a calcular una cotización en el servidor. Es la
 * única lectura pública de product_variants: la tabla base está cerrada a anon y
 * authenticated (guarda el precio al por mayor), y este cliente usa service_role.
 */
export async function getPricingRows(variantIds: string[]): Promise<VariantPricingRow[]> {
  // Un id que no es UUID (un carrito guardado antes de conectar la base) no
  // existe: no se consulta y queda como "no disponible" para que el cliente lo quite.
  const ids = variantIds.filter((id) => UUID_PATTERN.test(id));
  if (ids.length === 0) return [];

  const { data, error } = await createAdminClient()
    .from("product_variants")
    .select(
      "id, sku, capacity, color, battery_health, unlock_type, price_retail, stock, is_active, products!inner(name, slug, condition, is_active)",
    )
    .in("id", ids);
  if (error) throw new Error(`No se pudieron leer los precios: ${error.message}`);

  return data
    .filter((row) => row.is_active && row.products.is_active)
    .map((row) => ({
      variantId: row.id,
      productName: row.products.name,
      productSlug: row.products.slug,
      variantLabel: variantLabel({
        capacity: row.capacity,
        color: row.color,
        batteryHealth: row.battery_health,
        unlockType: row.unlock_type,
      }),
      condition: row.products.condition,
      code: row.sku,
      priceRetail: row.price_retail,
      stock: row.stock,
    }));
}
