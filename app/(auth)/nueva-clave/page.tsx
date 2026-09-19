import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { getViewer } from "@/lib/auth/viewer";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
};

export default async function NewPasswordPage() {
  // Solo se llega con la sesión que abre el enlace del correo.
  if (!(await getViewer())) redirect("/recuperar");

  return (
    <AuthCard title="Elige tu nueva contraseña" description="Mínimo 8 caracteres.">
      <NewPasswordForm />
    </AuthCard>
  );
}
