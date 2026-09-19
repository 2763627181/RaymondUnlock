import "server-only";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/inventory";
import { ADMIN_PAGE_SIZE, pageRange } from "@/lib/admin/pagination";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

export interface ProductListFilters {
  q: string;
  category: string;
  brand: string;
  status: "activo" | "inactivo" | "";
  lowStock: boolean;
  page: number;
}

export interface ProductListRow {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  stock: number;
  hasLowStock: boolean;
  variantCount: number;
  isActive: boolean;
  isFeatured: boolean;
  updatedAt: string;
}

const EMPTY = { rows: [] as ProductListRow[], total: 0 };

/** Quita los caracteres que PostgREST interpreta dentro de un patrón `ilike`. */
function safePattern(query: string): string {
  return query.replace(/[%_,()\\]/g, " ").trim();
}

/**
 * Listado del panel: los productos se leen con la sesión del admin (RLS); las
 * variantes —que traen el precio al por mayor— con service_role, y solo se
 * exponen los agregados (rango de precio unitario y stock).
 */
export async function listAdminProducts(
  filters: ProductListFilters,
): Promise<{ rows: ProductListRow[]; total: number }> {
  const supabase = await createSessionClient();
  const admin = createAdminClient();

  let restrictToIds: string[] | null = null;
  if (filters.lowStock) {
    const { data } = await admin
      .from("product_variants")
      .select("product_id")
      .eq("is_active", true)
      .lte("stock", LOW_STOCK_THRESHOLD);
    restrictToIds = [...new Set((data ?? []).map((variant) => variant.product_id))];
    if (restrictToIds.length === 0) return EMPTY;
  }

  let categoryIds: string[] | null = null;
  if (filters.category) {
    const { data } = await supabase.from("categories").select("id, parent_id");
    categoryIds = (data ?? [])
      .filter((row) => row.id === filters.category || row.parent_id === filters.category)
      .map((row) => row.id);
  }

  let query = supabase
    .from("products")
    .select(
      "id, slug, name, is_active, is_featured, updated_at, category:categories(name), brand:brands(name)",
      {
        count: "exact",
      },
    );
  if (restrictToIds) query = query.in("id", restrictToIds);
  if (categoryIds) query = query.in("category_id", categoryIds);
  if (filters.brand) query = query.eq("brand_id", filters.brand);
  if (filters.status) query = query.eq("is_active", filters.status === "activo");
  const pattern = safePattern(filters.q);
  if (pattern) query = query.ilike("name", `%${pattern}%`);

  const { from, to } = pageRange(filters.page, ADMIN_PAGE_SIZE);
  const {
    data: products,
    count,
    error,
  } = await query.order("updated_at", { ascending: false }).range(from, to);
  if (error) throw new Error(`No se pudo leer productos: ${error.message}`);
  if (products.length === 0) return { rows: [], total: count ?? 0 };

  const ids = products.map((product) => product.id);
  const [variants, images] = await Promise.all([
    admin
      .from("product_variants")
      .select("product_id, price_retail, stock, is_active")
      .in("product_id", ids),
    supabase
      .from("product_images")
      .select("product_id, url, sort_order")
      .in("product_id", ids)
      .order("sort_order"),
  ]);

  const firstImage = new Map<string, string>();
  for (const image of images.data ?? []) {
    if (!firstImage.has(image.product_id)) firstImage.set(image.product_id, image.url);
  }

  const rows = products.map((product): ProductListRow => {
    const own = (variants.data ?? []).filter((variant) => variant.product_id === product.id);
    const active = own.filter((variant) => variant.is_active);
    const prices = active.map((variant) => variant.price_retail);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand?.name ?? null,
      category: product.category?.name ?? null,
      imageUrl: firstImage.get(product.id) ?? null,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      stock: active.reduce((sum, variant) => sum + variant.stock, 0),
      hasLowStock: active.some((variant) => variant.stock <= LOW_STOCK_THRESHOLD),
      variantCount: own.length,
      isActive: product.is_active,
      isFeatured: product.is_featured,
      updatedAt: product.updated_at,
    };
  });
  return { rows, total: count ?? rows.length };
}
