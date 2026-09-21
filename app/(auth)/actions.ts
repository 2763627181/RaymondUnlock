"use server";

import { clientIp } from "@/lib/auth/client-ip";
import { safeNextPath } from "@/lib/auth/paths";
import { failure, validationFailure } from "@/lib/actions/result";
import { allowAttempt } from "@/lib/rate-limit";
import { createSessionClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export type LoginResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

/** Mismo mensaje para correo inexistente, contraseña errónea y cuenta sin rol admin. */
const INVALID_CREDENTIALS = "Correo o contraseña incorrectos.";

/**
 * Inicio de sesión del panel. En el sitio solo el administrador tiene sesión: si
 * las credenciales son válidas pero la cuenta no tiene rol admin, se cierra la
 * sesión al instante y se responde igual que con una contraseña errónea.
 */
export async function login(input: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  if (!allowAttempt(`login:${await clientIp()}`, { limit: 10, windowMs: 15 * 60 * 1000 })) {
    return failure("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return failure(INVALID_CREDENTIALS);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return failure(INVALID_CREDENTIALS);
  }

  return { ok: true, redirectTo: safeNextPath(parsed.data.next, "/admin") };
}

export async function logout(): Promise<void> {
  await (await createSessionClient()).auth.signOut();
}
