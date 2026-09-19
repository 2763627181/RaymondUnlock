import "server-only";
import { headers } from "next/headers";

/** IP del visitante para limitar intentos (Vercel y proxies la ponen en x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
