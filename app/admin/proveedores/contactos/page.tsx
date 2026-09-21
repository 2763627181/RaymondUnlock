import type { Metadata } from "next";
import { WholesaleAdminHeader } from "@/components/admin/wholesale-admin-header";
import { WholesaleContactsManager } from "@/components/admin/wholesale-contacts-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contactos de venta" };

export default async function AdminWholesaleContactsPage() {
  await requireAdmin("/admin/proveedores/contactos");
  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from("wholesale_contacts")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);

  return (
    <>
      <WholesaleAdminHeader
        title="Contactos de venta"
        description="Los vendedores a los que el cliente puede mandar su pedido por WhatsApp."
      />
      <WholesaleContactsManager contacts={data} />
    </>
  );
}
