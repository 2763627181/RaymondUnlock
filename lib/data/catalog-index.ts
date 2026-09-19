import { toCardData } from "@/lib/catalog/cards";
import type {
  Brand,
  CatalogProduct,
  CatalogVariant,
  Category,
  ProductCardData,
  ProductImage,
} from "@/types/catalog";
import type { CatalogSnapshot } from "./snapshot";

/** El snapshot con búsquedas por id/slug ya resueltas. Se arma por consulta: es O(n). */
export interface CatalogIndex {
  categories: Category[];
  brands: Brand[];
  products: CatalogProduct[];
  categoryById: Map<string, Category>;
  categoryBySlug: Map<string, Category>;
  brandById: Map<string, Brand>;
  productBySlug: Map<string, CatalogProduct>;
  variantsByProduct: Map<string, CatalogVariant[]>;
  imagesByProduct: Map<string, ProductImage[]>;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const list = groups.get(key(item)) ?? [];
    list.push(item);
    groups.set(key(item), list);
  }
  return groups;
}

export function buildCatalogIndex(snapshot: CatalogSnapshot): CatalogIndex {
  const categoryById = new Map(snapshot.categories.map((category) => [category.id, category]));
  const variantsByProduct = groupBy(snapshot.variants, (variant) => variant.productId);
  for (const list of variantsByProduct.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);

  // Un producto sin variantes públicas (borrador) o con la categoría oculta no
  // se puede pintar: se omite en vez de tumbar toda la tienda.
  const products = snapshot.products.filter(
    (product) =>
      categoryById.has(product.categoryId) && (variantsByProduct.get(product.id)?.length ?? 0) > 0,
  );

  return {
    categories: snapshot.categories,
    brands: snapshot.brands,
    products,
    categoryById,
    categoryBySlug: new Map(snapshot.categories.map((category) => [category.slug, category])),
    brandById: new Map(snapshot.brands.map((brand) => [brand.id, brand])),
    productBySlug: new Map(products.map((product) => [product.slug, product])),
    variantsByProduct,
    imagesByProduct: groupBy(snapshot.images, (image) => image.productId),
  };
}

export function productVariants(index: CatalogIndex, product: CatalogProduct): CatalogVariant[] {
  return index.variantsByProduct.get(product.id) ?? [];
}

export function productImages(index: CatalogIndex, product: CatalogProduct): ProductImage[] {
  return index.imagesByProduct.get(product.id) ?? [];
}

export function categoryOf(index: CatalogIndex, product: CatalogProduct): Category {
  const category = index.categoryById.get(product.categoryId);
  if (!category) throw new Error(`Producto ${product.slug} sin categoría válida`);
  return category;
}

export function categoryWithDescendantIds(index: CatalogIndex, categoryId: string): Set<string> {
  const ids = new Set<string>([categoryId]);
  for (const category of index.categories) {
    if (category.parentId === categoryId) ids.add(category.id);
  }
  return ids;
}

export function cardFor(
  index: CatalogIndex,
  product: CatalogProduct,
  displayFilter?: (variant: CatalogVariant) => boolean,
): ProductCardData {
  return toCardData({
    product,
    category: categoryOf(index, product),
    brand: product.brandId ? (index.brandById.get(product.brandId) ?? null) : null,
    variants: productVariants(index, product),
    images: productImages(index, product),
    displayFilter,
  });
}
