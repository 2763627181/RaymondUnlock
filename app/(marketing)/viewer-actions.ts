"use server";

import { isWholesaleEligible, type AccountStatus } from "@/lib/auth/status";
import { getViewer } from "@/lib/auth/viewer";
import { createAdminClient } from "@/lib/supabase/admin";

export interface WholesaleTerms {
  price: number;
  minQty: number;
}

export interface ViewerContact {
  fullName: string | null;
  phone: string | null;
  email: string | null;
  businessName: string | null;
}

export interface ViewerSnapshot {
  status: AccountStatus | "anonymous";
  name: string | null;
  /** Sus propios datos, para precargar formularios. null si no hay sesión. */
  contact: ViewerContact | null;
  /** variantId → condiciones al por mayor. null para quien no puede verlas. */
  wholesale: Record<string, WholesaleTerms> | null;
}

const ANONYMOUS: ViewerSnapshot = {
  status: "anonymous",
  name: null,
  contact: null,
  wholesale: null,
};

/**
 * Único camino por el que un navegador recibe precios al por mayor: la sesión
 * se valida en el servidor y solo un mayorista aprobado (o un admin) obtiene el
 * mapa. Cualquier otro visitante recibe `wholesale: null`.
 */
export async function getViewerSnapshot(): Promise<ViewerSnapshot> {
  try {
    const viewer = await getViewer();
    if (!viewer) return ANONYMOUS;

    const name = viewer.fullName;
    const contact: ViewerContact = {
      fullName: viewer.fullName,
      phone: viewer.phone,
      email: viewer.email,
      businessName: viewer.businessName,
    };
    if (!isWholesaleEligible(viewer.status)) {
      return { status: viewer.status, name, contact, wholesale: null };
    }

    const { data, error } = await createAdminClient()
      .from("product_variants")
      .select("id, price_wholesale, min_wholesale_qty")
      .eq("is_active", true)
      .not("price_wholesale", "is", null);
    if (error) throw new Error(error.message);

    const wholesale: Record<string, WholesaleTerms> = {};
    for (const row of data) {
      if (row.price_wholesale !== null) {
        wholesale[row.id] = { price: row.price_wholesale, minQty: row.min_wholesale_qty };
      }
    }
    return { status: viewer.status, name, contact, wholesale };
  } catch (error) {
    console.error("[viewer] No se pudo leer la sesión:", error);
    return ANONYMOUS;
  }
}
