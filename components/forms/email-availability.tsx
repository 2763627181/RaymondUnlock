"use client";

import { createContext, useContext, type ReactNode } from "react";

// Por defecto apagado: un formulario fuera del proveedor nunca ofrece el correo.
const EmailAvailability = createContext(false);

/** Lo llena el servidor (`isEmailEnabled`) para que los formularios sepan si ofrecer el correo. */
export function EmailAvailabilityProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return <EmailAvailability.Provider value={enabled}>{children}</EmailAvailability.Provider>;
}

export function useEmailEnabled(): boolean {
  return useContext(EmailAvailability);
}
