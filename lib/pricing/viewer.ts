import "server-only";
import type { PriceTier } from "@/types/catalog";

/**
 * Tier real del visitante, decidido siempre en el servidor. Hasta la Fase 8 no
 * existen sesiones, así que todos los visitantes son clientes de precio unitario;
 * ahí pasa a leer el perfil (mayorista aprobado) con @supabase/ssr.
 */
export async function getViewerTier(): Promise<PriceTier> {
  return "retail";
}
