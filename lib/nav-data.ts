import type { NavCategory, NavLink } from "@/types/nav";

/**
 * Datos mock tipados (Fase 1). Se reemplazan por categorías/marcas reales
 * de Supabase en la Fase 3 — la forma ya coincide con `categories`/`brands`.
 */
export const navCategories: NavCategory[] = [
  {
    slug: "celulares",
    name: "Celulares",
    href: "/tienda/celulares",
    subcategories: [
      { slug: "nuevos", name: "Nuevos", href: "/tienda/celulares?condicion=nuevo" },
      { slug: "open-box", name: "Open Box", href: "/tienda/celulares?condicion=open_box" },
      { slug: "usados", name: "Usados", href: "/tienda/celulares?condicion=usado" },
    ],
    brands: ["iPhone", "Samsung Galaxy", "Xiaomi", "Google Pixel", "Motorola"],
    promo: {
      title: "Cambia tu equipo",
      subtitle: "Recibimos tu celular usado como parte de pago",
      href: "/tienda/celulares",
    },
  },
  {
    slug: "tablets",
    name: "Tablets",
    href: "/tienda/tablets",
    subcategories: [
      { slug: "nuevas", name: "Nuevas", href: "/tienda/tablets?condicion=nuevo" },
      { slug: "usadas", name: "Usadas", href: "/tienda/tablets?condicion=usado" },
    ],
    brands: ["iPad", "Galaxy Tab"],
    promo: {
      title: "Tablets para el hogar y la oficina",
      subtitle: "Con garantía y soporte postventa",
      href: "/tienda/tablets",
    },
  },
  {
    slug: "audio",
    name: "Audio",
    href: "/tienda/audio",
    subcategories: [
      { slug: "audifonos-in-ear", name: "Audífonos in-ear", href: "/tienda/audio" },
      { slug: "audifonos-over-ear", name: "Audífonos over-ear", href: "/tienda/audio" },
    ],
    brands: ["AirPods", "AirPods Pro", "AirPods Max", "Galaxy Buds"],
    promo: {
      title: "Sonido sin cables",
      subtitle: "Los AirPods y Galaxy Buds más buscados",
      href: "/tienda/audio",
    },
  },
  {
    slug: "smartwatches",
    name: "Smartwatches",
    href: "/tienda/smartwatches",
    subcategories: [{ slug: "todos", name: "Ver todos", href: "/tienda/smartwatches" }],
    brands: ["Apple Watch", "Galaxy Watch"],
    promo: {
      title: "Tu salud, en tu muñeca",
      subtitle: "Apple Watch y Galaxy Watch disponibles",
      href: "/tienda/smartwatches",
    },
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    href: "/tienda/accesorios",
    subcategories: [
      { slug: "cargadores", name: "Cargadores y cables", href: "/tienda/accesorios" },
      { slug: "cases", name: "Cases y protectores", href: "/tienda/accesorios" },
      { slug: "power-banks", name: "Power banks", href: "/tienda/accesorios" },
      { slug: "memorias", name: "Memorias y almacenamiento", href: "/tienda/accesorios" },
    ],
    brands: [],
    promo: {
      title: "Completa tu equipo",
      subtitle: "Cargadores, cases y protectores originales",
      href: "/tienda/accesorios",
    },
  },
];

export const navSecondaryLinks: NavLink[] = [{ name: "Servicios", href: "/servicios" }];

export const navWholesaleLink: NavLink = { name: "Al por mayor", href: "/mayorista" };

export const mobileBarLinks: NavLink[] = [
  { name: "Inicio", href: "/" },
  { name: "Tienda", href: "/tienda" },
];
