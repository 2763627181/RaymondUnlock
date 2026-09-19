import "server-only";
import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type {
  Brand,
  CatalogProduct,
  CatalogVariant,
  Category,
  ProductImage,
} from "@/types/catalog";
import { toBrand, toCategory, toImage, toProduct, toVariant } from "./mappers";

/** Etiqueta para invalidar el catálogo desde el admin con `revalidateTag`. */
export const CATALOG_TAG = "catalog";

const REVALIDATE_SECONDS = 300;

/** PostgREST devuelve como máximo 1000 filas por consulta. */
const ROW_LIMIT = 1000;

export interface CatalogSnapshot {
  categories: Category[];
  brands: Brand[];
  products: CatalogProduct[];
  variants: CatalogVariant[];
  images: ProductImage[];
}

function rowsOrThrow<T>(
  table: string,
  result: { data: T[] | null; error: { message: string } | null },
): T[] {
  if (result.error) throw new Error(`No se pudo leer ${table}: ${result.error.message}`);
  const rows = result.data ?? [];
  // Truncar en silencio dejaría productos fuera del sitio sin que nadie se entere.
  if (rows.length >= ROW_LIMIT) {
    throw new Error(
      `${table} alcanzó el límite de ${ROW_LIMIT} filas: hay que mover el filtrado del catálogo a SQL.`,
    );
  }
  return rows;
}

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  // Solo vistas públicas y tablas de lectura abierta: sin precio mayorista.
  // El RLS ya oculta lo inactivo a los visitantes.
  const supabase = createAnonClient();
  const [categories, brands, products, variants, images] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("brands").select("*").order("sort_order"),
    supabase.from("v_catalog_products").select("*").order("sort_order"),
    supabase.from("v_catalog_variants").select("*").order("sort_order"),
    supabase.from("v_catalog_images").select("*").order("sort_order"),
  ]);

  const mappedProducts = rowsOrThrow("v_catalog_products", products).map(toProduct);
  const nameByProductId = new Map(mappedProducts.map((product) => [product.id, product.name]));

  return {
    categories: rowsOrThrow("categories", categories).map(toCategory),
    brands: rowsOrThrow("brands", brands).map(toBrand),
    products: mappedProducts,
    variants: rowsOrThrow("v_catalog_variants", variants).map(toVariant),
    images: rowsOrThrow("v_catalog_images", images).map((row) =>
      toImage(row, nameByProductId.get(row.product_id ?? "") ?? ""),
    ),
  };
}

/**
 * Todo el catálogo público en una sola lectura cacheada 5 min (o hasta que el
 * admin invalide la etiqueta). Los filtros de /tienda se aplican en memoria
 * sobre este snapshot en vez de ir a la base en cada visita.
 */
export const getCatalogSnapshot = unstable_cache(loadCatalogSnapshot, ["catalog-snapshot"], {
  tags: [CATALOG_TAG],
  revalidate: REVALIDATE_SECONDS,
});
