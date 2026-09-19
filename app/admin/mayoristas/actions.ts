"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, success, type ActionResult } from "@/lib/actions/result";
import { dbFailure, withAdmin } from "@/lib/admin/action-helpers";
import { renderWholesaleDecisionEmail } from "@/lib/email/account-email";
import { sendEmail } from "@/lib/email/send";
import { getSiteSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

const reviewSchema = z.object({ userId: z.uuid(), decision: z.enum(["approve", "reject"]) });

/**
 * Aprueba o rechaza una cuenta al por mayor. El rol y la aprobación no son
 * editables por el propio usuario (permiso por columna), así que la decisión se
 * escribe con service_role, después de verificar que quien la pide es admin.
 */
export async function reviewWholesale(
  userId: string,
  decision: string,
): Promise<ActionResult<{ emailSent: boolean }>> {
  return withAdmin(async ({ viewer }) => {
    const parsed = reviewSchema.safeParse({ userId, decision });
    if (!parsed.success) return failure("Solicitud no válida.");
    if (parsed.data.userId === viewer.userId) return failure("No puedes cambiar tu propia cuenta.");
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", parsed.data.userId)
      .maybeSingle();
    if (!profile) return failure("No encontramos esa cuenta.");
    if (profile.role === "admin")
      return failure("Una cuenta de administrador no se puede modificar aquí.");

    const approve = parsed.data.decision === "approve";
    const { error } = await admin
      .from("profiles")
      .update({
        role: approve ? "wholesale" : "customer",
        wholesale_approved: approve,
        wholesale_reviewed_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.userId);
    if (error) return dbFailure(error);
    revalidatePath("/admin", "layout");

    // El correo de aviso no debe deshacer la decisión: si falla, se informa.
    let emailSent = false;
    if (profile.email) {
      const settings = await getSiteSettings();
      emailSent = await sendEmail({
        to: profile.email,
        ...renderWholesaleDecisionEmail({
          name: profile.full_name ?? "",
          approved: approve,
          shopUrl: `${SITE_URL}/tienda`,
          contact: { phoneDisplay: settings.phoneDisplay },
        }),
      });
    }
    return success({ emailSent });
  });
}
