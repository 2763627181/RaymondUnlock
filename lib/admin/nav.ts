import {
  Bookmark,
  FileText,
  Hammer,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  Settings,
  Tags,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type AdminBadgeKey = "quotes" | "repairs" | "wholesale";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Solo se marca activo en esa ruta exacta (el panel raíz). */
  exact?: boolean;
  badge?: AdminBadgeKey;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: Bookmark },
  { href: "/admin/servicios", label: "Servicios", icon: Wrench },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText, badge: "quotes" },
  { href: "/admin/reparaciones", label: "Reparaciones", icon: Hammer, badge: "repairs" },
  { href: "/admin/mayoristas", label: "Mayoristas", icon: Users, badge: "wholesale" },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export type AdminCounts = Record<AdminBadgeKey, number>;
