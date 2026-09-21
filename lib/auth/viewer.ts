import "server-only";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";

export interface Viewer {
  userId: string;
  email: string | null;
  fullName: string | null;
  isAdmin: boolean;
}

/**
 * Quién es el visitante, validado contra Supabase Auth (getUser, no la cookie
 * a ciegas). Memoizado por petición. null si no hay sesión válida.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return {
    userId: user.id,
    email: profile.email ?? user.email ?? null,
    fullName: profile.full_name,
    isAdmin: profile.role === "admin",
  };
});
