/**
 * Destino tras iniciar sesión o confirmar un correo. Solo se aceptan rutas
 * internas: un `next` como `//sitio.com` o `https://…` sería un redirect abierto.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/cuenta"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  const blocked = ["/login", "/registro", "/recuperar", "/auth"];
  if (blocked.some((prefix) => next === prefix || next.startsWith(`${prefix}/`))) return fallback;
  return next;
}
