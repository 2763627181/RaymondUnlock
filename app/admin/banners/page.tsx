import type { Metadata } from "next";
import { BannersManager } from "@/components/admin/banners-manager";
import { PageHeader } from "@/components/admin/page-header";
import { createSessionClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  await requireAdmin("/admin/banners");
  const { data, error } = await (
    await createSessionClient()
  )
    .from("banners")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader
        title="Banners de la portada"
        description="El carrusel principal de la página de inicio. Arrastra para cambiar el orden."
      />
      <BannersManager banners={data} />
    </>
  );
}
