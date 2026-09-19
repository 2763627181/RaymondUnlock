import "server-only";
import { getViewer } from "@/lib/auth/viewer";
import { isWholesaleEligible } from "@/lib/auth/status";
import type { PriceTier } from "@/types/catalog";

/**
 * Tier real del visitante y su usuario, decididos siempre en el servidor a
 * partir de la sesión: mayorista aprobado (o admin) → "wholesale"; todos los
 * demás → "retail". Lo que diga el navegador nunca cuenta.
 */
export async function getQuoteViewer(): Promise<{ tier: PriceTier; userId: string | null }> {
  const viewer = await getViewer();
  if (!viewer) return { tier: "retail", userId: null };
  return {
    tier: isWholesaleEligible(viewer.status) ? "wholesale" : "retail",
    userId: viewer.userId,
  };
}
