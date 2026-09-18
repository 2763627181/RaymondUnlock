export interface NavSubcategory {
  slug: string;
  name: string;
  href: string;
}

export interface NavPromo {
  title: string;
  subtitle: string;
  href: string;
}

export interface NavCategory {
  slug: string;
  name: string;
  href: string;
  subcategories: NavSubcategory[];
  brands: string[];
  promo: NavPromo;
}

export interface NavLink {
  name: string;
  href: string;
}
