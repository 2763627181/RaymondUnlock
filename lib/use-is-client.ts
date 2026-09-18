"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false en el servidor y durante la hidratación; true después. Evita que datos
 * de localStorage (carrito) generen un HTML distinto al del servidor.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
