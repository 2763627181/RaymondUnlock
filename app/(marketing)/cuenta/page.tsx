import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileForm } from "@/components/auth/profile-form";
import { WholesaleRequestForm } from "@/components/auth/wholesale-request-form";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { AccountStatus } from "@/lib/auth/status";
import { getViewer } from "@/lib/auth/viewer";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

const STATUS_COPY: Partial<
  Record<AccountStatus, { icon: typeof Clock; title: string; text: string; tone: string }>
> = {
  wholesale: {
    icon: BadgeCheck,
    title: "Cuenta al por mayor aprobada",
    text: "Ves el precio al por mayor y la cantidad mínima de cada producto. Con el interruptor “Ver precios” del encabezado alternas entre unidad y por mayor.",
    tone: "border-success-700/30 bg-success-700/5",
  },
  wholesale_pending: {
    icon: Clock,
    title: "Solicitud en revisión",
    text: "Estamos revisando tu solicitud de cuenta al por mayor. Mientras tanto ves los precios por unidad; te avisaremos por correo cuando la aprobemos.",
    tone: "border-border bg-surface-2",
  },
  wholesale_rejected: {
    icon: Clock,
    title: "Tu solicitud no fue aprobada",
    text: "Tu cuenta sigue activa y compras a precio por unidad. Si algo cambió, puedes enviar una solicitud nueva abajo.",
    tone: "border-border bg-surface-2",
  },
  admin: {
    icon: ShieldCheck,
    title: "Administrador",
    text: "Tienes acceso al panel de administración y ves los precios al por mayor para revisar el sitio.",
    tone: "border-border bg-surface-2",
  },
};

export default async function AccountPage({ searchParams }: PageProps<"/cuenta">) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/cuenta");

  const { acceso } = await searchParams;
  const deniedAdmin = acceso === "admin" && viewer.status !== "admin";
  const status = STATUS_COPY[viewer.status];
  const canRequestWholesale =
    viewer.status === "customer" || viewer.status === "wholesale_rejected";

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mi cuenta</h1>
      <p className="text-muted-foreground mt-1">{viewer.email}</p>

      {deniedAdmin ? (
        <div
          role="alert"
          className="border-brand-red-600/30 bg-brand-red-600/5 mt-8 rounded-xl border p-5"
        >
          <h2 className="font-semibold">Esta cuenta no tiene acceso al panel</h2>
          <p className="text-muted-foreground mt-1 text-[15px] leading-relaxed">
            El panel de administración es solo para cuentas con rol de administrador. Si formas
            parte del equipo, pide que te lo asignen; mientras tanto tu cuenta funciona con
            normalidad.
          </p>
        </div>
      ) : null}

      {status ? (
        <div className={`mt-8 flex gap-4 rounded-xl border p-5 ${status.tone}`}>
          <status.icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">{status.title}</h2>
            <p className="text-muted-foreground mt-1 text-[15px] leading-relaxed">{status.text}</p>
            {viewer.status === "admin" ? (
              <Button asChild className="mt-4 h-10">
                <Link href="/admin">Ir al panel</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="mt-10" aria-labelledby="datos">
        <h2 id="datos" className="mb-5 text-xl font-semibold">
          Mis datos
        </h2>
        <ProfileForm
          defaults={{
            fullName: viewer.fullName ?? "",
            phone: viewer.phone ?? "",
            businessName: viewer.businessName ?? "",
            rnc: viewer.rnc ?? "",
          }}
        />
      </section>

      {canRequestWholesale ? (
        <section className="mt-12" aria-labelledby="mayorista">
          <h2 id="mayorista" className="text-xl font-semibold">
            ¿Tienes un negocio?
          </h2>
          <p className="text-muted-foreground mt-1 mb-5 text-[15px]">
            Pide tu cuenta al por mayor y, al aprobarla, verás los precios por volumen.
          </p>
          <WholesaleRequestForm
            defaults={{ businessName: viewer.businessName ?? "", rnc: viewer.rnc ?? "" }}
          />
        </section>
      ) : null}

      <div className="mt-12">
        <LogoutButton className="h-11" />
      </div>
    </Container>
  );
}
