import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form-lazy";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;

  return (
    <AuthCard
      title="Iniciar sesión"
      description="Acceso al panel de administración de Raymond Unlock."
    >
      <LoginForm next={Array.isArray(next) ? next[0] : next} />
    </AuthCard>
  );
}
