import { selectCanSeeWholesale, useViewerStore } from "@/lib/viewer/store";
import type { WholesaleTerms } from "@/app/(marketing)/viewer-actions";

/** Condiciones al por mayor de una variante, o null si el visitante no las ve. */
export function useWholesaleTerms(variantId: string): WholesaleTerms | null {
  return useViewerStore((state) =>
    selectCanSeeWholesale(state) ? (state.wholesale?.[variantId] ?? null) : null,
  );
}

/**
 * El precio al por mayor más bajo entre las variantes de una tarjeta, solo si
 * el visitante puede verlo Y eligió "Por mayor" en el interruptor del encabezado.
 */
export function useWholesaleFrom(variantIds: readonly string[]): WholesaleTerms | null {
  const canSee = useViewerStore(selectCanSeeWholesale);
  const view = useViewerStore((state) => state.priceView);
  const terms = useViewerStore((state) => state.wholesale);
  if (!canSee || view !== "wholesale" || !terms) return null;

  let best: WholesaleTerms | null = null;
  for (const id of variantIds) {
    const candidate = terms[id];
    if (candidate && (best === null || candidate.price < best.price)) best = candidate;
  }
  return best;
}
