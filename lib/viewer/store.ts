import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ViewerContact,
  ViewerSnapshot,
  WholesaleTerms,
} from "@/app/(marketing)/viewer-actions";
import { isWholesaleEligible } from "@/lib/auth/status";

export const PRICE_VIEW_STORAGE_KEY = "ru-price-view";

export type PriceView = "retail" | "wholesale";

interface ViewerState {
  /** "unknown" hasta que se sabe quién es; mientras tanto se muestra el precio por unidad. */
  status: ViewerSnapshot["status"] | "unknown";
  name: string | null;
  contact: ViewerContact | null;
  wholesale: Record<string, WholesaleTerms> | null;
  priceView: PriceView;
  setSnapshot: (snapshot: ViewerSnapshot) => void;
  setPriceView: (view: PriceView) => void;
}

export const useViewerStore = create<ViewerState>()(
  persist(
    (set) => ({
      status: "unknown",
      name: null,
      contact: null,
      wholesale: null,
      // Un mayorista aprobado espera ver su precio: es el valor inicial.
      priceView: "wholesale",
      setSnapshot: (snapshot) =>
        set({
          status: snapshot.status,
          name: snapshot.name,
          contact: snapshot.contact,
          wholesale: snapshot.wholesale,
        }),
      setPriceView: (priceView) => set({ priceView }),
    }),
    {
      name: PRICE_VIEW_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ priceView: state.priceView }),
    },
  ),
);

/** true si el visitante puede ver precios al por mayor y ya se cargaron. */
export function selectCanSeeWholesale(state: ViewerState): boolean {
  return (
    state.status !== "unknown" &&
    state.status !== "anonymous" &&
    isWholesaleEligible(state.status) &&
    state.wholesale !== null
  );
}
