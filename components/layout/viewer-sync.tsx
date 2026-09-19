"use client";

import { useEffect } from "react";
import { getViewerSnapshot } from "@/app/(marketing)/viewer-actions";
import { useViewerStore } from "@/lib/viewer/store";

/** Cookie de sesión de Supabase (`sb-<ref>-auth-token`, a veces en trozos). */
function hasSessionCookie(): boolean {
  return document.cookie.split("; ").some((cookie) => /^sb-.+-auth-token/.test(cookie));
}

/**
 * Averigua quién es el visitante SIN volver dinámicas las páginas estáticas:
 * sin cookie de sesión no hace ninguna petición (el 99 % de las visitas);
 * con cookie, pide al servidor su estado y, si es mayorista aprobado, su mapa
 * de precios.
 */
export function ViewerSync() {
  const setSnapshot = useViewerStore((state) => state.setSnapshot);

  useEffect(() => {
    if (!hasSessionCookie()) {
      setSnapshot({ status: "anonymous", name: null, contact: null, wholesale: null });
      return;
    }
    let cancelled = false;
    getViewerSnapshot().then((snapshot) => {
      if (!cancelled) setSnapshot(snapshot);
    });
    return () => {
      cancelled = true;
    };
  }, [setSnapshot]);

  return null;
}
