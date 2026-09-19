import { z } from "zod";
import {
  hourSchema,
  iconCopySchema,
  stepSchema,
  testimonialSchema,
} from "@/lib/validation/settings";

export type Row = Record<string, string>;

export interface ListField {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "icon";
  placeholder?: string;
}

export interface ListSectionConfig {
  rowSchema: z.ZodType<Row, Row>;
  fields: ListField[];
  blankRow: () => Row;
  maxRows: number;
  addLabel: string;
  rowLabel: string;
  /** Convierte las filas al valor que guarda la base (p. ej. lista → objeto por slug). */
  toValue?: (rows: Row[]) => unknown;
}

const navPromoRowSchema = z.object({
  slug: z.string().trim().min(1, "Es obligatorio").max(60),
  title: z.string().trim().min(1, "Es obligatorio").max(60),
  subtitle: z.string().trim().min(1, "Es obligatorio").max(100),
  href: z.string().trim().min(1, "Es obligatorio").max(200),
});

const iconCopyFields: ListField[] = [
  { name: "icon", label: "Icono", kind: "icon" },
  { name: "title", label: "Título" },
  { name: "text", label: "Texto", kind: "textarea" },
];

/**
 * Configuración de cada lista editable. Vive en el cliente porque contiene
 * funciones y esquemas Zod, que un Server Component no puede pasar como props.
 */
export const LIST_SECTIONS = {
  hours: {
    rowSchema: hourSchema,
    fields: [
      { name: "label", label: "Días", placeholder: "Lunes a viernes" },
      { name: "value", label: "Horario", placeholder: "9:00 a. m. – 6:00 p. m." },
    ],
    blankRow: () => ({ label: "", value: "" }),
    maxRows: 10,
    addLabel: "Agregar horario",
    rowLabel: "Horario",
  },
  guarantees: {
    rowSchema: iconCopySchema,
    fields: iconCopyFields,
    blankRow: () => ({ icon: "badge-check", title: "", text: "" }),
    maxRows: 6,
    addLabel: "Agregar elemento",
    rowLabel: "Elemento",
  },
  why_us: {
    rowSchema: iconCopySchema,
    fields: iconCopyFields,
    blankRow: () => ({ icon: "badge-check", title: "", text: "" }),
    maxRows: 6,
    addLabel: "Agregar elemento",
    rowLabel: "Elemento",
  },
  repair_process: {
    rowSchema: stepSchema,
    fields: [
      { name: "title", label: "Título del paso" },
      { name: "text", label: "Texto", kind: "textarea" },
    ],
    blankRow: () => ({ title: "", text: "" }),
    maxRows: 6,
    addLabel: "Agregar paso",
    rowLabel: "Paso",
  },
  testimonials: {
    rowSchema: testimonialSchema,
    fields: [
      { name: "name", label: "Nombre", placeholder: "Carlos M." },
      { name: "detail", label: "Detalle", placeholder: "Cliente en Santo Domingo" },
      { name: "quote", label: "Opinión", kind: "textarea" },
    ],
    blankRow: () => ({ id: `t-${Date.now().toString(36)}`, name: "", detail: "", quote: "" }),
    maxRows: 12,
    addLabel: "Agregar testimonio",
    rowLabel: "Testimonio",
  },
  nav_promos: {
    rowSchema: navPromoRowSchema,
    fields: [
      { name: "slug", label: "Slug de la categoría", placeholder: "celulares" },
      { name: "title", label: "Título" },
      { name: "subtitle", label: "Subtítulo" },
      { name: "href", label: "Enlace", placeholder: "/tienda/celulares" },
    ],
    blankRow: () => ({ slug: "", title: "", subtitle: "", href: "" }),
    maxRows: 8,
    addLabel: "Agregar promo",
    rowLabel: "Promo",
    toValue: (rows) => Object.fromEntries(rows.map(({ slug, ...promo }) => [slug, promo])),
  },
} satisfies Record<string, ListSectionConfig>;

export type ListSectionKey = keyof typeof LIST_SECTIONS;
