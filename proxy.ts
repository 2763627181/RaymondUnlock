import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Solo el panel tiene sesión. El rol de admin se verifica además en su layout y en cada acción. */
const PROTECTED_PREFIX = "/admin";

function redirectWithCookies(url: URL, from: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith(PROTECTED_PREFIX)) {
    if (!userId) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", `${pathname}${search}`);
      return redirectWithCookies(login, response);
    }
    // Las páginas con sesión nunca deben quedar en cachés compartidas.
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  // Con sesión, /login no tiene sentido: directo al panel.
  if (userId && pathname === "/login") {
    return redirectWithCookies(new URL("/admin", request.url), response);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
