import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RecoverForm } from "@/components/auth/recover-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function RecoverPage() {
  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Escribe tu correo y te enviamos un enlace para elegir una contraseña nueva."
      footer={
        <Link href="/login" className="text-brand-blue hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <RecoverForm />
    </AuthCard>
  );
}
