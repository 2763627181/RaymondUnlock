export type ProductCondition = "nuevo" | "open_box" | "usado" | "reacondicionado";

export type PriceTier = "retail" | "wholesale";

export type SortOption = "relevancia" | "precio-asc" | "precio-desc" | "nuevos";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  sortOrder: number;
}

/** Forma pública de una variante: nunca incluye el precio mayorista. */
export interface CatalogVariant {
  id: string;
  productId: string;
  sku: string | null;
  capacity: string | null;
  color: string | null;
  colorHex: string | null;
  priceRetail: number;
  compareAtPrice: number | null;
  stock: number;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: string;
  brandId: string | null;
  condition: ProductCondition;
  specs: Record<string, string>;
  isFeatured: boolean;
  warrantyNote: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ProductDetail extends CatalogProduct {
  category: Category;
  brand: Brand | null;
  variants: CatalogVariant[];
  images: ProductImage[];
}

export interface CardColor {
  name: string;
  hex: string;
}

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  categorySlug: string;
  categoryIcon: string | null;
  condition: ProductCondition;
  minPrice: number;
  maxPrice: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  inStock: boolean;
  imageUrl: string | null;
  imageAlt: string;
  colors: CardColor[];
  variantCount: number;
  /** Variante con la que se agrega al carrito desde la tarjeta (solo si es única). */
  quickAddVariantId: string | null;
  quickAddLabel: string | null;
}

export interface CatalogFilters {
  categorySlug: string | null;
  brandSlugs: string[];
  conditions: ProductCondition[];
  priceMin: number | null;
  priceMax: number | null;
  capacities: string[];
  onlyInStock: boolean;
  query: string | null;
  sort: SortOption;
  limit: number;
}

export interface FacetBrand {
  slug: string;
  name: string;
  count: number;
}

export interface CatalogFacets {
  brands: FacetBrand[];
  conditions: { value: ProductCondition; count: number }[];
  capacities: string[];
  priceBounds: { min: number; max: number };
}

export interface CatalogPage {
  items: ProductCardData[];
  total: number;
  facets: CatalogFacets;
}
