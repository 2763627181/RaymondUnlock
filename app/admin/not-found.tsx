import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "No encontrado" };

/** 404 dentro del panel (un id que no existe o ya se borró), sin salir al chrome de la tienda. */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center text-center">
      <p className="text-brand-red-600 text-sm font-semibold">Error 404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">No encontramos ese registro</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-[15px] leading-relaxed">
        Puede que ya se haya eliminado o que el enlace esté incompleto.
      </p>
      <Button asChild className="mt-6 h-10">
        <Link href="/admin">Volver al panel</Link>
      </Button>
    </div>
  );
}
