import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage(props: PageProps<"/login">) {
  const { next, error } = await props.searchParams;

  return (
    <AuthCard
      title="Iniciar sesión"
      description="Entra para ver tus datos y, si tienes cuenta al por mayor, los precios por volumen."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="text-brand-blue hover:underline">
            Crear una cuenta
          </Link>
        </>
      }
    >
      {first(error) === "enlace" ? (
        <p role="alert" className="text-destructive mb-5 text-sm">
          Ese enlace ya se usó o venció. Inicia sesión, o pide uno nuevo con “Olvidé mi contraseña”.
        </p>
      ) : null}
      <LoginForm next={first(next)} />
    </AuthCard>
  );
}
