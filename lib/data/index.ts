import "server-only";

/** Único punto de entrada a los datos: las páginas y acciones no importan Supabase directamente. */
export { getBanners } from "./banners";
export {
  getAllProductSlugs,
  getBrands,
  getCategories,
  getCategoryBySlug,
  getFeaturedProducts,
  getNavCategories,
  getProductBySlug,
  getPromoProducts,
  getRelatedProducts,
  getTopLevelCategories,
  listProducts,
} from "./catalog";
export { getPricingRows } from "./pricing";
export { createQuote, createRepairRequest } from "./requests";
export { getServiceBySlug, getServices } from "./services";
export { getSiteSettings } from "./settings";
