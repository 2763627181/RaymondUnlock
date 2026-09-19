import "server-only";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { accountStatus, type AccountStatus } from "./status";

export interface Viewer {
  userId: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  businessName: string | null;
  rnc: string | null;
  status: AccountStatus;
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
    .select(
      "email, role, wholesale_approved, wholesale_reviewed_at, full_name, phone, business_name, rnc",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return {
    userId: user.id,
    email: profile.email ?? user.email ?? null,
    fullName: profile.full_name,
    phone: profile.phone,
    businessName: profile.business_name,
    rnc: profile.rnc,
    status: accountStatus({
      role: profile.role,
      approved: profile.wholesale_approved,
      reviewedAt: profile.wholesale_reviewed_at,
    }),
  };
});
