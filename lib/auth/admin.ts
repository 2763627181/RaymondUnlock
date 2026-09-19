import "server-only";
import { notFound, redirect } from "next/navigation";
import { failure, type ActionFailure } from "@/lib/actions/result";
import { createSessionClient } from "@/lib/supabase/server";
import { getViewer, type Viewer } from "./viewer";

/**
 * Guarda para páginas y layouts del panel: sin sesión manda a /login; con
 * sesión pero sin rol admin responde 404 (no revela que /admin existe).
 */
export async function requireAdmin(nextPath = "/admin"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (viewer.status !== "admin") notFound();
  return viewer;
}

export type AdminContext = {
  ok: true;
  viewer: Viewer;
  /** Cliente con la sesión del admin: el RLS de la base sigue siendo la última barrera. */
  supabase: Awaited<ReturnType<typeof createSessionClient>>;
};

/** Guarda para Server Actions: se llama al inicio de CADA acción del panel. */
export async function assertAdmin(): Promise<AdminContext | ActionFailure> {
  const viewer = await getViewer();
  if (!viewer || viewer.status !== "admin") return failure("No tienes permiso para hacer esto.");
  return { ok: true, viewer, supabase: await createSessionClient() };
}
