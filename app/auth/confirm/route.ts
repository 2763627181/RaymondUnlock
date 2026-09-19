import { NextResponse, type NextRequest } from "next/server";
import { notifyWholesaleRequest } from "@/lib/auth/notify";
import { safeNextPath } from "@/lib/auth/paths";
import { createSessionClient } from "@/lib/supabase/server";

const OTP_TYPES = ["signup", "recovery", "magiclink"] as const;
type OtpType = (typeof OTP_TYPES)[number];

function isOtpType(value: string | null): value is OtpType {
  return OTP_TYPES.some((type) => type === value);
}

/** Verifica el enlace del correo (confirmación, recuperación o reenvío) y abre la sesión. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const invalid = new URL("/login?error=enlace", request.url);
  if (!tokenHash || !isOtpType(type)) return NextResponse.redirect(invalid);

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) return NextResponse.redirect(invalid);

  if (type === "signup") await notifyWholesaleRequest(data.user.id);

  const fallback = type === "recovery" ? "/nueva-clave" : "/cuenta";
  return NextResponse.redirect(
    new URL(safeNextPath(searchParams.get("next"), fallback), request.url),
  );
}
