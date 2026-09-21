/** Colores de la marca para los informes (hex sin "#"; el PDF le antepone "#" y Excel "FF"). */
export const BRAND = {
  red: "E11B22",
  redDark: "C2161C",
  redTint: "FDECEC",
  ink: "0B0B0C",
  ink700: "3A3B3E",
  muted: "6B7280",
  surface2: "F5F6F8",
  border: "E6E8EC",
  white: "FFFFFF",
  onInkMuted: "B8BCC4",
  success: "166534",
} as const;

export interface StatusColors {
  bg: string;
  fg: string;
}

/** Colores de cada estado (los mismos criterios del panel: legibles sobre su fondo). */
export const STATUS_COLORS: Record<string, StatusColors> = {
  nueva: { bg: BRAND.red, fg: BRAND.white },
  contactada: { bg: "FEF3C7", fg: "78350F" },
  cotizada: { bg: "DBEAFE", fg: "1E3A8A" },
  cerrada: { bg: "DCFCE7", fg: "166534" },
  cancelada: { bg: "E5E7EB", fg: "4B5563" },
};

export const NEUTRAL_STATUS: StatusColors = { bg: "E5E7EB", fg: "4B5563" };

export function statusColors(status: string): StatusColors {
  return STATUS_COLORS[status] ?? NEUTRAL_STATUS;
}
