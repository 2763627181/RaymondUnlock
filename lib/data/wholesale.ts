import "server-only";
import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { WholesaleContact, WholesaleItem, WholesaleListing } from "@/lib/wholesale/types";
import type { Tables } from "@/types/database";

/** Etiqueta para invalidar el listado desde /admin/proveedores con `updateTag`. */
export const WHOLESALE_TAG = "wholesale";

const REVALIDATE_SECONDS = 300;
/** PostgREST devuelve como máximo 1000 filas por consulta: se lee por páginas. */
const PAGE_SIZE = 1000;
const MAX_ROWS = 10_000;

async function readProducts(): Promise<Tables<"wholesale_products">[]> {
  // El RLS ya oculta lo inactivo a los visitantes.
  const supabase = createAnonClient();
  const rows: Tables<"wholesale_products">[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("wholesale_products")
      .select("*")
      .order("sort_order")
      .order("name")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`No se pudo leer el listado al por mayor: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
  }
  // Truncar en silencio dejaría productos fuera de la página sin que nadie se entere.
  throw new Error(`El listado al por mayor supera las ${MAX_ROWS} filas.`);
}

function toItem(row: Tables<"wholesale_products">): WholesaleItem {
  return {
    id: row.id,
    name: row.name,
    type: row.product_type,
    category: row.category,
    condition: row.condition,
    price: row.price,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  };
}

function toContact(row: Tables<"wholesale_contacts">): WholesaleContact {
  return { id: row.id, label: row.label, personName: row.person_name, whatsapp: row.whatsapp };
}

async function loadListing(): Promise<WholesaleListing> {
  const [products, contacts] = await Promise.all([
    readProducts(),
    createAnonClient()
      .from("wholesale_contacts")
      .select("*")
      .order("sort_order")
      .order("created_at"),
  ]);
  if (contacts.error) {
    throw new Error(`No se pudieron leer los contactos: ${contacts.error.message}`);
  }

  const latest = products.reduce<string | null>(
    (max, row) => (max === null || new Date(row.updated_at) > new Date(max) ? row.updated_at : max),
    null,
  );
  return { items: products.map(toItem), contacts: contacts.data.map(toContact), updatedAt: latest };
}

/** Lista y contactos, cacheados 5 min (o hasta que el admin invalide la etiqueta). */
export const getWholesaleListing = unstable_cache(loadListing, ["wholesale-listing"], {
  tags: [WHOLESALE_TAG],
  revalidate: REVALIDATE_SECONDS,
});

/** Precio, nombre y condición vigentes de esos productos (solo los activos): base del cálculo del pedido. */
export async function getWholesalePriceRows(ids: string[]): Promise<WholesaleItem[]> {
  const { data, error } = await createAnonClient()
    .from("wholesale_products")
    .select("*")
    .in("id", ids);
  if (error) throw new Error(`No se pudieron leer los precios: ${error.message}`);
  return data.map(toItem);
}
