"use client";

import Link from "next/link";
import { BadgeCheck, Clock } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form-lazy";
import { Button } from "@/components/ui/button";
import { useViewerStore } from "@/lib/viewer/store";

/**
 * La página /mayorista es estática, así que qué mostrar según la sesión se
 * decide en el navegador: visitante → formulario; con cuenta → su estado.
 */
export function WholesaleSignup() {
  const status = useViewerStore((state) => state.status);

  if (status === "wholesale") {
    return (
      <Notice icon={BadgeCheck} title="Tu cuenta al por mayor está aprobada">
        <p>Ya ves el precio al por mayor en todo el catálogo.</p>
        <Button asChild className="mt-4 h-11">
          <Link href="/tienda">Ir a la tienda</Link>
        </Button>
      </Notice>
    );
  }
  if (status === "wholesale_pending") {
    return (
      <Notice icon={Clock} title="Tu solicitud está en revisión">
        <p>
          Te avisaremos por correo en cuanto la aprobemos. Mientras tanto ves precios por unidad.
        </p>
      </Notice>
    );
  }
  if (status === "customer" || status === "wholesale_rejected") {
    return (
      <Notice icon={BadgeCheck} title="Ya tienes una cuenta">
        <p>Pide el acceso al por mayor desde tu cuenta, sin crear otra.</p>
        <Button asChild className="mt-4 h-11">
          <Link href="/cuenta">Ir a mi cuenta</Link>
        </Button>
      </Notice>
    );
  }
  if (status === "admin") return null;

  return (
    <div className="bg-surface border-border mx-auto w-full max-w-lg rounded-2xl border p-6 shadow-sm sm:p-8">
      <RegisterForm initialType="wholesale" lockType />
      <p className="text-muted-foreground mt-5 text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-brand-blue underline underline-offset-4">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

function Notice({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Clock;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border-border mx-auto flex w-full max-w-lg gap-4 rounded-2xl border p-6">
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="text-muted-foreground text-[15px] leading-relaxed">
        <h3 className="text-foreground font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  );
}
