import "server-only";
import type { AdminCounts } from "@/lib/admin/nav";
import { createSessionClient } from "@/lib/supabase/server";

/** Contadores de pendientes para la barra lateral (usan la sesión del admin: el RLS decide). */
export async function getAdminCounts(): Promise<AdminCounts> {
  const supabase = await createSessionClient();
  const head = { count: "exact", head: true } as const;

  const [quotes, repairs] = await Promise.all([
    supabase.from("quotes").select("id", head).eq("status", "nueva"),
    supabase.from("repair_requests").select("id", head).eq("status", "nueva"),
  ]);

  return {
    quotes: quotes.count ?? 0,
    repairs: repairs.count ?? 0,
  };
}
