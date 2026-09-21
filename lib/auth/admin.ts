import "server-only";
import { redirect } from "next/navigation";
import { failure, type ActionFailure } from "@/lib/actions/result";
import { createSessionClient } from "@/lib/supabase/server";
import { getViewer, type Viewer } from "./viewer";

/**
 * Guarda para páginas y layouts del panel: sin sesión manda a /login; con
 * sesión pero sin rol admin manda a /cuenta con un aviso. Un 404 aquí solo
 * confundía: que /admin existe ya lo delata el redirect a /login, y quien
 * acaba de iniciar sesión necesita saber por qué no entra.
 */
export async function requireAdmin(nextPath = "/admin"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (viewer.status !== "admin") redirect("/cuenta?acceso=admin");
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
