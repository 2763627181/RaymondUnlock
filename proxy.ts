import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Rutas que exigen sesión. El rol de admin se verifica además en su layout y en cada acción. */
const PROTECTED_PREFIXES = ["/admin", "/cuenta"];
/** Rutas de acceso: si ya hay sesión no tiene sentido mostrarlas. */
const GUEST_ONLY = ["/login", "/registro", "/recuperar"];

function redirectWithCookies(url: URL, from: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!userId && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(login, response);
  }

  if (userId && GUEST_ONLY.includes(pathname)) {
    return redirectWithCookies(new URL("/cuenta", request.url), response);
  }

  // Las páginas con sesión nunca deben quedar en cachés compartidas.
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cuenta/:path*",
    "/login",
    "/registro",
    "/recuperar",
    "/nueva-clave",
    "/auth/:path*",
  ],
};
