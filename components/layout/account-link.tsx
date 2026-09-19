"use client";

import Link from "next/link";
import { User, UserCheck } from "lucide-react";
import { useViewerStore } from "@/lib/viewer/store";

/** Icono de cuenta del encabezado: lleva a /login o, con sesión, a /cuenta. */
export function AccountLink() {
  const status = useViewerStore((state) => state.status);
  const loggedIn = status !== "unknown" && status !== "anonymous";
  const Icon = loggedIn ? UserCheck : User;

  return (
    <Link
      href={loggedIn ? "/cuenta" : "/login"}
      aria-label={loggedIn ? "Mi cuenta" : "Iniciar sesión"}
      className="hover:bg-muted hidden size-9 items-center justify-center rounded-md transition-colors sm:flex"
    >
      <Icon className="text-ink-700 size-5" aria-hidden="true" />
    </Link>
  );
}
