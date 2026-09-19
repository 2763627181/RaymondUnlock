import "server-only";
import { z } from "zod";
import { renderWholesaleRequestEmail } from "@/lib/email/account-email";
import { sendEmail } from "@/lib/email/send";
import { SITE_URL } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

/** Correo del negocio: la variable de entorno manda; si no, el de los ajustes del sitio. */
export async function businessNotificationEmail(): Promise<string | undefined> {
  if (process.env.ORDER_NOTIFICATION_EMAIL) return process.env.ORDER_NOTIFICATION_EMAIL;
  const { data } = await createAdminClient()
    .from("site_settings")
    .select("value")
    .eq("key", "business")
    .maybeSingle();
  const settings = z.object({ email: z.string() }).safeParse(data?.value);
  return settings.success ? settings.data.email : undefined;
}

/** Avisa al negocio de una solicitud mayorista pendiente (solo si el correo ya está verificado). */
export async function notifyWholesaleRequest(userId: string): Promise<void> {
  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select(
      "email, role, wholesale_approved, full_name, phone, business_name, rnc, estimated_volume",
    )
    .eq("id", userId)
    .maybeSingle();
  if (!profile || profile.role !== "wholesale" || profile.wholesale_approved) return;

  const to = await businessNotificationEmail();
  if (!to) return;

  await sendEmail({
    to,
    ...renderWholesaleRequestEmail({
      fullName: profile.full_name ?? "Sin nombre",
      email: profile.email ?? "",
      phone: profile.phone,
      businessName: profile.business_name,
      rnc: profile.rnc,
      estimatedVolume: profile.estimated_volume,
      reviewUrl: `${SITE_URL}/admin/mayoristas`,
    }),
  });
}
