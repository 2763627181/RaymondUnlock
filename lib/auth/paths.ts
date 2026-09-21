/**
 * Destino tras iniciar sesión. Solo se aceptan rutas internas: un `next` como
 * `//sitio.com` o `https://…` sería un redirect abierto.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/admin"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  if (next === "/login" || next.startsWith("/login/")) return fallback;
  return next;
}
