import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ServicesManager } from "@/components/admin/services-manager";
import { createSessionClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Servicios" };

export default async function AdminServicesPage() {
  await requireAdmin("/admin/servicios");
  const { data, error } = await (
    await createSessionClient()
  )
    .from("services")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="Servicios técnicos"
        description="Lo que se muestra en /servicios. Los precios son “desde”: el costo final se da tras el diagnóstico."
      />
      <ServicesManager services={data} />
    </>
  );
}
