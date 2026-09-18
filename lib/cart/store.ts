import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const CART_STORAGE_KEY = "ru-cart-v1";
export const MAX_LINE_QUANTITY = 99;

/** Datos solo para mostrar. El precio real siempre se recalcula en el servidor. */
export interface CartSnapshot {
  productName: string;
  productSlug: string;
  variantLabel: string | null;
  unitPrice: number;
  imageUrl: string | null;
  icon: string | null;
  colorHex: string | null;
}

export interface CartItem {
  variantId: string;
  quantity: number;
  snapshot: CartSnapshot;
}

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setDrawerOpen: (open: boolean) => void;
}

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(MAX_LINE_QUANTITY, Math.floor(quantity)));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((line) => line.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.variantId === item.variantId
                  ? {
                      ...line,
                      quantity: clampQuantity(line.quantity + quantity),
                      snapshot: item.snapshot,
                    }
                  : line,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: clampQuantity(quantity) }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.variantId === variantId ? { ...line, quantity: clampQuantity(quantity) } : line,
          ),
        })),
      remove: (variantId) =>
        set((state) => ({ items: state.items.filter((line) => line.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartDisplaySubtotal(items: CartItem[]): number {
  return items.reduce((sum, line) => sum + line.snapshot.unitPrice * line.quantity, 0);
}
