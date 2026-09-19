"use server";

import { clientIp } from "@/lib/auth/client-ip";
import { safeNextPath } from "@/lib/auth/paths";
import { notifyWholesaleRequest } from "@/lib/auth/notify";
import { getViewer } from "@/lib/auth/viewer";
import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { renderConfirmAccountEmail, renderPasswordResetEmail } from "@/lib/email/account-email";
import { sendEmail } from "@/lib/email/send";
import { allowAttempt } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";
import {
  emailSchema,
  loginSchema,
  newPasswordSchema,
  profileSchema,
  recoverSchema,
  registerSchema,
  wholesaleRequestSchema,
} from "@/lib/validation/auth";

const HOUR_MS = 60 * 60 * 1000;
const TOO_MANY = "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";

export type LoginResult =
  | { ok: true; redirectTo: string }
  | {
      ok: false;
      message: string;
      /** El correo existe pero falta confirmarlo: el formulario ofrece reenviar el enlace. */
      unconfirmed?: boolean;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function login(input: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  if (!allowAttempt(`login:${await clientIp()}`, { limit: 10, windowMs: 15 * 60 * 1000 })) {
    return failure(TOO_MANY);
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return {
        ok: false,
        unconfirmed: true,
        message: "Confirma tu correo antes de entrar. Revisa tu bandeja o pide un enlace nuevo.",
      };
    }
    // Mismo mensaje para correo inexistente y contraseña errónea: no se revela cuál falló.
    return failure("Correo o contraseña incorrectos.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const fallback = profile?.role === "admin" ? "/admin" : "/cuenta";
  return { ok: true, redirectTo: safeNextPath(parsed.data.next, fallback) };
}

/** Enlace verificado en servidor: /auth/confirm hace `verifyOtp` con este hash. */
function confirmLink(hashedToken: string, type: "signup" | "recovery" | "magiclink"): string {
  const params = new URLSearchParams({ token_hash: hashedToken, type });
  return `${SITE_URL}/auth/confirm?${params.toString()}`;
}

/** Sin RESEND_API_KEY (desarrollo) el enlace se imprime en la consola del servidor. */
async function deliver(to: string, message: { subject: string; html: string }, link: string) {
  const sent = await sendEmail({ to, ...message });
  if (!sent && process.env.NODE_ENV !== "production") {
    console.warn(`[auth] Correo no enviado (modo desarrollo). Enlace para ${to}: ${link}`);
  }
  return sent;
}

export async function register(input: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const data = parsed.data;
  if (!allowAttempt(`register:${await clientIp()}`, { limit: 5, windowMs: HOUR_MS })) {
    return failure(TOO_MANY);
  }

  // El usuario se crea sin confirmar y el correo lo enviamos nosotros con Resend
  // (el SMTP integrado de Supabase solo entrega a correos del equipo).
  const { data: generated, error } = await createAdminClient().auth.admin.generateLink({
    type: "signup",
    email: data.email,
    password: data.password,
    options: {
      data: {
        account_type: data.accountType,
        full_name: data.fullName,
        phone: data.phone,
        business_name: data.businessName,
        rnc: data.rnc,
        estimated_volume: data.estimatedVolume,
      },
    },
  });

  if (error) {
    // Correo ya registrado: se responde igual que en un alta nueva para no revelar quién tiene cuenta.
    if (error.code === "email_exists") return success({ email: data.email });
    console.error("[auth] No se pudo crear la cuenta:", error.message);
    return failure(
      "No pudimos crear tu cuenta en este momento. Inténtalo de nuevo en unos minutos.",
    );
  }

  const link = confirmLink(generated.properties.hashed_token, "signup");
  const sent = await deliver(
    data.email,
    renderConfirmAccountEmail({
      name: data.fullName,
      link,
      wholesale: data.accountType === "wholesale",
    }),
    link,
  );
  if (!sent && process.env.NODE_ENV === "production") {
    return failure(
      "Creamos tu cuenta, pero no pudimos enviar el correo de confirmación. Pide un enlace nuevo desde “Iniciar sesión”.",
    );
  }
  return success({ email: data.email });
}

export async function resendConfirmation(input: unknown): Promise<ActionResult<void>> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  if (!allowAttempt(`resend:${await clientIp()}`, { limit: 5, windowMs: HOUR_MS })) {
    return failure(TOO_MANY);
  }

  // Un magiclink verifica el correo y abre sesión; solo lo recibe quien controla el buzón.
  const { data, error } = await createAdminClient().auth.admin.generateLink({
    type: "magiclink",
    email: parsed.data,
  });
  if (!error) {
    const link = confirmLink(data.properties.hashed_token, "magiclink");
    await deliver(
      parsed.data,
      renderConfirmAccountEmail({
        name: data.user.user_metadata?.full_name ?? "",
        link,
        wholesale: data.user.user_metadata?.account_type === "wholesale",
      }),
      link,
    );
  }
  return success();
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult<void>> {
  const parsed = recoverSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  if (!allowAttempt(`recover:${await clientIp()}`, { limit: 5, windowMs: HOUR_MS })) {
    return failure(TOO_MANY);
  }

  const { data, error } = await createAdminClient().auth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
  });
  // Exista o no el correo, la respuesta es la misma.
  if (!error) {
    const link = confirmLink(data.properties.hashed_token, "recovery");
    await deliver(parsed.data.email, renderPasswordResetEmail({ link }), link);
  }
  return success();
}

export async function updatePassword(input: unknown): Promise<ActionResult<void>> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  if (!(await getViewer()))
    return failure("Tu enlace venció. Pide uno nuevo desde “Olvidé mi contraseña”.");

  const { error } = await (
    await createSessionClient()
  ).auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return failure("No pudimos cambiar la contraseña. Inténtalo de nuevo.");
  return success();
}

export async function updateProfile(input: unknown): Promise<ActionResult<void>> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const viewer = await getViewer();
  if (!viewer) return failure("Inicia sesión para editar tu perfil.");

  // Con la sesión del propio usuario: el RLS y el permiso por columna impiden tocar role o aprobación.
  const { error } = await (
    await createSessionClient()
  )
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      business_name: parsed.data.businessName ?? null,
      rnc: parsed.data.rnc ?? null,
    })
    .eq("id", viewer.userId);
  if (error) return failure("No pudimos guardar tus datos. Inténtalo de nuevo.");
  return success();
}

export async function requestWholesaleAccess(input: unknown): Promise<ActionResult<void>> {
  const parsed = wholesaleRequestSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const viewer = await getViewer();
  if (!viewer) return failure("Inicia sesión para pedir tu cuenta al por mayor.");
  if (viewer.status !== "customer" && viewer.status !== "wholesale_rejected") {
    return failure("Tu cuenta ya tiene una solicitud al por mayor.");
  }

  // Solo la base puede cambiar el rol: se hace con service_role y siempre SIN aprobar.
  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      role: "wholesale",
      wholesale_approved: false,
      wholesale_reviewed_at: null,
      business_name: parsed.data.businessName,
      rnc: parsed.data.rnc ?? null,
      estimated_volume: parsed.data.estimatedVolume ?? null,
    })
    .eq("id", viewer.userId);
  if (error) return failure("No pudimos enviar tu solicitud. Inténtalo de nuevo.");

  await notifyWholesaleRequest(viewer.userId);
  return success();
}

export async function logout(): Promise<void> {
  await (await createSessionClient()).auth.signOut();
}
