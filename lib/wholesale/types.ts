/** Un producto del listado al por mayor (los precios de esta lista son públicos a propósito). */
export interface WholesaleItem {
  id: string;
  name: string;
  type: string;
  category: string;
  condition: string;
  price: number;
  imageUrl: string | null;
  sortOrder: number;
}

/** A quién se le manda el pedido por WhatsApp ("Ventas 1 — Ashley"). */
export interface WholesaleContact {
  id: string;
  label: string;
  personName: string | null;
  /** Solo dígitos con código de país, listo para wa.me. */
  whatsapp: string;
}

export interface WholesaleListing {
  items: WholesaleItem[];
  contacts: WholesaleContact[];
  /** Última vez que cambió algo de la lista (para la fecha que se muestra arriba). */
  updatedAt: string | null;
}

export interface WholesaleFilters {
  query: string;
  types: string[];
  categories: string[];
  conditions: string[];
}

export const EMPTY_FILTERS: WholesaleFilters = {
  query: "",
  types: [],
  categories: [],
  conditions: [],
};

export const MAX_WHOLESALE_QUANTITY = 999;
export const MAX_WHOLESALE_LINES = 100;
