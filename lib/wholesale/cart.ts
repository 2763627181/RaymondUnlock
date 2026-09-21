import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  MAX_WHOLESALE_LINES,
  MAX_WHOLESALE_QUANTITY,
  type WholesaleItem,
} from "@/lib/wholesale/types";

export const WHOLESALE_CART_KEY = "ru-wholesale-v1";

/** Datos solo para mostrar. El precio real se vuelve a leer en el servidor al enviar. */
export interface WholesaleSnapshot {
  name: string;
  condition: string;
  price: number;
  imageUrl: string | null;
}

export interface WholesaleLine {
  id: string;
  quantity: number;
  snapshot: WholesaleSnapshot;
}

interface WholesaleCartState {
  lines: WholesaleLine[];
  add: (item: WholesaleItem) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Alinea el pedido guardado con la lista actual: precios al día y sin productos que ya no están. */
  sync: (items: WholesaleItem[]) => void;
}

const clamp = (quantity: number) =>
  Math.max(1, Math.min(MAX_WHOLESALE_QUANTITY, Math.floor(quantity)));

function snapshotOf(item: WholesaleItem): WholesaleSnapshot {
  return { name: item.name, condition: item.condition, price: item.price, imageUrl: item.imageUrl };
}

export const useWholesaleCart = create<WholesaleCartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (item) =>
        set((state) => {
          const existing = state.lines.find((line) => line.id === item.id);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.id === item.id ? { ...line, quantity: clamp(line.quantity + 1) } : line,
              ),
            };
          }
          if (state.lines.length >= MAX_WHOLESALE_LINES) return state;
          return {
            lines: [...state.lines, { id: item.id, quantity: 1, snapshot: snapshotOf(item) }],
          };
        }),
      setQuantity: (id, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id ? { ...line, quantity: clamp(quantity) } : line,
          ),
        })),
      remove: (id) => set((state) => ({ lines: state.lines.filter((line) => line.id !== id) })),
      clear: () => set({ lines: [] }),
      sync: (items) =>
        set((state) => {
          const byId = new Map(items.map((item) => [item.id, item]));
          return {
            lines: state.lines.flatMap((line) => {
              const item = byId.get(line.id);
              return item ? [{ ...line, snapshot: snapshotOf(item) }] : [];
            }),
          };
        }),
    }),
    {
      name: WHOLESALE_CART_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

const round2 = (amount: number) => Math.round(amount * 100) / 100;

export const lineTotal = (line: WholesaleLine) => round2(line.snapshot.price * line.quantity);

export function wholesaleCount(lines: WholesaleLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function wholesaleTotal(lines: WholesaleLine[]): number {
  return round2(lines.reduce((sum, line) => sum + lineTotal(line), 0));
}
