import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { failure, type ActionFailure, type ActionResult } from "@/lib/actions/result";
import { storagePathFromUrl } from "@/lib/admin/storage-path";
import { assertAdmin, type AdminContext } from "@/lib/auth/admin";
import { BANNERS_TAG } from "@/lib/data/banners";
import { SETTINGS_TAG } from "@/lib/data/settings";
import { SERVICES_TAG } from "@/lib/data/services";
import { CATALOG_TAG } from "@/lib/data/snapshot";
import { WHOLESALE_TAG } from "@/lib/data/wholesale";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Envuelve una Server Action del panel: exige rol admin (se vuelve a verificar
 * en CADA acción, nunca se confía en que la página ya lo hizo) y convierte
 * cualquier excepción en un mensaje en vez de tumbar la petición.
 */
export async function withAdmin<T>(
  run: (context: AdminContext) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  try {
    return await run(auth);
  } catch (error) {
    console.error("[admin] Error en una acción:", error);
    return failure("Ocurrió un error inesperado. Inténtalo de nuevo.");
  }
}

const TAG_BY_AREA = {
  catalog: CATALOG_TAG,
  settings: SETTINGS_TAG,
  services: SERVICES_TAG,
  banners: BANNERS_TAG,
  wholesale: WHOLESALE_TAG,
} as const;

/**
 * Publica los cambios: expira la caché de datos y las páginas estáticas que la
 * usan para que la tienda muestre lo guardado de inmediato (no a los 5 min).
 */
export function publish(...areas: (keyof typeof TAG_BY_AREA)[]): void {
  for (const area of areas) updateTag(TAG_BY_AREA[area]);
  revalidatePath("/", "layout");
}

interface PostgresLikeError {
  code?: string;
  message: string;
}

/** Traduce los errores de restricción de Postgres a un mensaje que el admin pueda actuar. */
export function dbFailure(
  error: PostgresLikeError,
  messages: { unique?: string; foreignKey?: string } = {},
): ActionFailure {
  if (error.code === "23505") return failure(messages.unique ?? "Ya existe un registro igual.");
  if (error.code === "23503") {
    return failure(messages.foreignKey ?? "Otros registros dependen de este; no se puede hacer.");
  }
  console.error("[admin] Error de base de datos:", error.message);
  return failure("No pudimos guardar los cambios. Inténtalo de nuevo.");
}

/**
 * Borra de Storage las imágenes cuyas URLs ya no usa nadie. Se ignoran las que
 * no son de nuestro bucket (imágenes de ejemplo) y un fallo solo se registra:
 * dejar un archivo huérfano es mejor que impedir el borrado del registro.
 */
export async function removeStoredImages(urls: string[]): Promise<void> {
  const paths = urls.flatMap((url) => {
    const path = storagePathFromUrl(url);
    return path ? [path] : [];
  });
  if (paths.length === 0) return;
  const { error } = await createAdminClient().storage.from("products").remove(paths);
  if (error) console.error("[admin] No se pudieron borrar imágenes de Storage:", error.message);
}
