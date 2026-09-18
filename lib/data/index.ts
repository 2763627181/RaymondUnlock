import "server-only";

/**
 * Único punto de entrada a los datos. Hoy apunta a la implementación mock;
 * en la Fase 2 se reemplaza por Supabase sin tocar las páginas.
 */
export {
  getAllProductSlugs,
  getBanners,
  getBrands,
  getCategories,
  getCategoryBySlug,
  getFeaturedProducts,
  getNavCategories,
  getPricingRows,
  getProductBySlug,
  getPromoProducts,
  getRelatedProducts,
  getServiceBySlug,
  getServices,
  getSiteSettings,
  getTopLevelCategories,
  listProducts,
} from "./mock/repo";
