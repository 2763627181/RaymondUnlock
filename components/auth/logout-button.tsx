"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await logout();
    // Recarga completa a propósito: con navegación suave el panel seguiría en
    // memoria en esta pestaña después de cerrar sesión.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  return (
    <Button variant="outline" className={className} onClick={onClick} disabled={pending}>
      <LogOut aria-hidden="true" />
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </Button>
  );
}
