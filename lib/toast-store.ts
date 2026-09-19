import { create } from "zustand";

export type ToastVariant = "default" | "success" | "destructive";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  /** true desde el primer aviso: el componente visual se descarga bajo demanda. */
  used: boolean;
  add: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  used: false,
  add: (toast) =>
    set((state) => ({
      used: true,
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    })),
}));

export function toast(options: { title: string; description?: string; variant?: ToastVariant }) {
  useToastStore.getState().add({ variant: "default", ...options });
}
