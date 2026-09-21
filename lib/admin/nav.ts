import {
  Bookmark,
  FileText,
  Hammer,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Store,
  Tags,
  TrendingUp,
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
  { href: "/admin/buscar", label: "Buscar producto", icon: Search },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: Bookmark },
  { href: "/admin/servicios", label: "Servicios", icon: Wrench },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText, badge: "quotes" },
  { href: "/admin/reparaciones", label: "Reparaciones", icon: Hammer, badge: "repairs" },
  { href: "/admin/ventas", label: "Ventas", icon: TrendingUp },
  { href: "/admin/proveedores", label: "Listado mayorista", icon: Store, badge: "wholesale" },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export type AdminCounts = Record<AdminBadgeKey, number>;
