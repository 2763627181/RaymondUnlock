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
    // Recarga completa: borra del navegador todo lo que dependía de la sesión.
    window.location.assign("/");
  }

  return (
    <Button variant="outline" className={className} onClick={onClick} disabled={pending}>
      <LogOut aria-hidden="true" />
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </Button>
  );
}
