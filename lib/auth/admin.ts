import "server-only";
import { notFound, redirect } from "next/navigation";
import { failure, type ActionFailure } from "@/lib/actions/result";
import { createSessionClient } from "@/lib/supabase/server";
import { getViewer, type Viewer } from "./viewer";

/**
 * Guarda para páginas y layouts del panel: sin sesión manda a /login. Una sesión
 * sin rol admin no debería existir (el login la rechaza), así que si aparece
 * —una cuenta creada por fuera de la app— recibe 404.
 */
export async function requireAdmin(nextPath = "/admin"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!viewer.isAdmin) notFound();
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
  if (!viewer || !viewer.isAdmin) return failure("No tienes permiso para hacer esto.");
  return { ok: true, viewer, supabase: await createSessionClient() };
}
