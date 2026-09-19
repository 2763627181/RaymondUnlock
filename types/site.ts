export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  priceFrom: number | null;
  turnaround: string | null;
  deviceTypes: string[];
  sortOrder: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  theme: "dark" | "light";
  sortOrder: number;
  /** Precio "desde" derivado del producto o categoría a la que apunta ctaHref. */
  fromPrice: number | null;
}

export interface IconCopy {
  icon: string;
  title: string;
  text: string;
}

export interface Testimonial {
  id: string;
  name: string;
  detail: string;
  quote: string;
}

export interface NavPromo {
  title: string;
  subtitle: string;
  href: string;
}

export interface HoursRow {
  label: string;
  value: string;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  description: string;
  address: string;
  addressParts: {
    street: string;
    locality: string;
    postalCode: string;
    country: string;
  };
  phoneDisplay: string;
  shippingNote: string;
  whatsappNumber: string;
  email: string;
  instagramUrl: string;
  threadsUrl: string;
  facebookUrl: string | null;
  guarantees: IconCopy[];
  whyUs: IconCopy[];
  repairProcess: { title: string; text: string }[];
  testimonials: Testimonial[];
  navPromos: Record<string, NavPromo>;
  /** Horarios de atención; vacío hasta que el negocio los configure. */
  hours: HoursRow[];
}

export interface NavSubcategory {
  slug: string;
  name: string;
  href: string;
}

export interface NavBrand {
  slug: string;
  name: string;
  href: string;
}

export interface NavCategory {
  slug: string;
  name: string;
  href: string;
  subcategories: NavSubcategory[];
  brands: NavBrand[];
  promo: NavPromo | null;
}

export interface NavLink {
  name: string;
  href: string;
}
