import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCounts } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel Raymond Unlock" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // La autorización real: sin sesión manda a /login; sin rol admin responde 404.
  const viewer = await requireAdmin();
  const counts = await getAdminCounts();

  return (
    <AdminShell counts={counts} userName={viewer.fullName ?? viewer.email ?? "Administrador"}>
      {children}
    </AdminShell>
  );
}
