import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form-lazy";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default async function RegisterPage(props: PageProps<"/registro">) {
  const { tipo } = await props.searchParams;
  const initialType =
    (Array.isArray(tipo) ? tipo[0] : tipo) === "mayorista" ? "wholesale" : "customer";

  return (
    <AuthCard
      title="Crear cuenta"
      description="Guarda tus datos para cotizar más rápido. Si tienes un negocio, pide tu cuenta al por mayor."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-brand-blue underline underline-offset-4">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <RegisterForm initialType={initialType} />
    </AuthCard>
  );
}
