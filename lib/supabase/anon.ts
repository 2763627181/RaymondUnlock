import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente sin sesión ni cookies, con la llave pública: lo que puede leer es
 * exactamente lo que puede leer cualquier visitante (RLS). Al no tocar cookies
 * no vuelve dinámicas las páginas estáticas ni las cacheadas.
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
