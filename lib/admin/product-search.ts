import "server-only";
import { z } from "zod";
import { searchClause } from "@/lib/admin/quotes-query";
import { variantLabel } from "@/lib/catalog/cards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";
import type { ProductCondition } from "@/types/catalog";

const MAX_HITS = 30;
const MAX_QUERY = 80;

export interface SearchVariant {
  id: string;
  code: string | null;
  label: string | null;
  stock: number;
  priceRetail: number;
  /** Esta variante es la que coincide con lo buscado (código o ID). */
  matched: boolean;
}

export interface SearchHit {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  condition: ProductCondition;
  categoryName: string | null;
  variants: SearchVariant[];
}

export interface SearchResult {
  query: string;
  hits: SearchHit[];
  /** Si lo escrito es exactamente un código o un ID, el producto al que ir directo. */
  exactProductId: string | null;
}

interface VariantMatch {
  id: string;
  product_id: string;
  sku: string | null;
}

async function matchVariants(query: string, isUuid: boolean): Promise<VariantMatch[]> {
  const table = createAdminClient().from("product_variants").select("id, product_id, sku");
  if (isUuid) {
    const { data, error } = await table.eq("id", query);
    if (error) throw new Error(`No se pudo buscar: ${error.message}`);
    return data;
  }
  const clause = searchClause(query, ["sku"]);
  if (!clause) return [];
  const { data, error } = await table.or(clause).limit(MAX_HITS);
  if (error) throw new Error(`No se pudo buscar: ${error.message}`);
  return data;
}

async function matchProductIds(query: string, isUuid: boolean): Promise<string[]> {
  const supabase = await createSessionClient();
  const table = supabase.from("products").select("id");
  if (isUuid) {
    const { data, error } = await table.eq("id", query);
    if (error) throw new Error(`No se pudo buscar: ${error.message}`);
    return data.map((row) => row.id);
  }
  const clause = searchClause(query, ["name", "slug"]);
  if (!clause) return [];
  const { data, error } = await table.or(clause).limit(MAX_HITS);
  if (error) throw new Error(`No se pudo buscar: ${error.message}`);
  return data.map((row) => row.id);
}

/**
 * Busca productos por código (SKU), ID (del producto o de una variante), enlace
 * o nombre. Solo para el panel: lee product_variants con service_role, así que
 * quien la llame debe haber pasado antes por requireAdmin().
 */
export async function searchProducts(rawQuery: string): Promise<SearchResult> {
  const query = rawQuery.trim().slice(0, MAX_QUERY);
  if (!query) return { query, hits: [], exactProductId: null };

  const isUuid = z.uuid().safeParse(query).success;
  const [variantMatches, productIds] = await Promise.all([
    matchVariants(query, isUuid),
    matchProductIds(query, isUuid),
  ]);

  const matchedVariantIds = new Set(variantMatches.map((match) => match.id));
  const ids = [...new Set([...variantMatches.map((match) => match.product_id), ...productIds])];
  if (ids.length === 0) return { query, hits: [], exactProductId: null };

  const supabase = await createSessionClient();
  const [products, variants, categories] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, is_active, condition, category_id")
      .in("id", ids.slice(0, MAX_HITS)),
    createAdminClient()
      .from("product_variants")
      .select(
        "id, product_id, sku, capacity, color, battery_health, unlock_type, stock, price_retail, sort_order",
      )
      .in("product_id", ids.slice(0, MAX_HITS))
      .order("sort_order"),
    supabase.from("categories").select("id, name"),
  ]);
  if (products.error) throw new Error(`No se pudo buscar: ${products.error.message}`);
  if (variants.error) throw new Error(`No se pudo buscar: ${variants.error.message}`);

  const categoryNames = new Map((categories.data ?? []).map((item) => [item.id, item.name]));
  const hits = products.data
    .map((product): SearchHit => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      isActive: product.is_active,
      condition: product.condition,
      categoryName: categoryNames.get(product.category_id) ?? null,
      variants: variants.data
        .filter((variant) => variant.product_id === product.id)
        .map((variant) => ({
          id: variant.id,
          code: variant.sku,
          label: variantLabel({
            capacity: variant.capacity,
            color: variant.color,
            batteryHealth: variant.battery_health,
            unlockType: variant.unlock_type,
          }),
          stock: variant.stock,
          priceRetail: variant.price_retail,
          matched: matchedVariantIds.has(variant.id),
        })),
    }))
    // Primero los que coinciden por código o ID; luego, por nombre.
    .sort(
      (a, b) =>
        Number(b.variants.some((v) => v.matched)) - Number(a.variants.some((v) => v.matched)) ||
        a.name.localeCompare(b.name, "es"),
    );

  const exactCodeProducts = new Set(
    variantMatches
      .filter((match) => isUuid || match.sku?.toLowerCase() === query.toLowerCase())
      .map((match) => match.product_id),
  );
  const exactProductIds = isUuid
    ? new Set([...exactCodeProducts, ...productIds])
    : exactCodeProducts;
  const [only] = exactProductIds.size === 1 ? exactProductIds : [];

  return { query, hits, exactProductId: only ?? null };
}
