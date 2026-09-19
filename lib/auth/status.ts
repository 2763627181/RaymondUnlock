import type { Enums } from "@/types/database";

/**
 * Estado de una cuenta, derivado de su perfil (no hay enum en la base):
 *  - wholesale + aprobada      → "wholesale"
 *  - wholesale sin aprobar     → "wholesale_pending"
 *  - customer ya revisada      → "wholesale_rejected" (su solicitud se rechazó)
 */
export type AccountStatus =
  "customer" | "wholesale_pending" | "wholesale_rejected" | "wholesale" | "admin";

export function accountStatus(input: {
  role: Enums<"user_role">;
  approved: boolean;
  reviewedAt: string | null;
}): AccountStatus {
  if (input.role === "admin") return "admin";
  if (input.role === "wholesale") return input.approved ? "wholesale" : "wholesale_pending";
  return input.reviewedAt !== null ? "wholesale_rejected" : "customer";
}

/** Quién puede ver y comprar a precio al por mayor. El admin lo ve para poder revisar el sitio. */
export function isWholesaleEligible(status: AccountStatus): boolean {
  return status === "wholesale" || status === "admin";
}
