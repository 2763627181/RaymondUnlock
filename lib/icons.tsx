import {
  BadgeCheck,
  Battery,
  Camera,
  Cpu,
  Droplets,
  Headphones,
  Lock,
  MessageCircle,
  Plug,
  ShieldCheck,
  Smartphone,
  Speaker,
  Tablet,
  Truck,
  Watch,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Los nombres guardados en las columnas `icon` de la base de datos se resuelven
 * aquí. Es una lista cerrada a propósito: importar todo `lucide-react` por nombre
 * dinámico dejaría cientos de iconos sin usar en el bundle.
 */
const ICONS: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  battery: Battery,
  camera: Camera,
  cpu: Cpu,
  droplets: Droplets,
  headphones: Headphones,
  lock: Lock,
  "message-circle": MessageCircle,
  plug: Plug,
  "shield-check": ShieldCheck,
  smartphone: Smartphone,
  speaker: Speaker,
  tablet: Tablet,
  truck: Truck,
  watch: Watch,
  wrench: Wrench,
};

export const ICON_NAMES = Object.keys(ICONS);

export function DynamicIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = (name ? ICONS[name] : undefined) ?? Wrench;
  return <Icon className={className} aria-hidden="true" />;
}
