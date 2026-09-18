import type { SiteSettings } from "@/types/site";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18099063114";

/**
 * Los textos de garantías, "por qué nosotros" y testimonios son propuestas para
 * confirmar con el cliente; en la Fase 2 pasan a `site_settings` y se editan
 * desde /admin/ajustes.
 */
export const siteSettings: SiteSettings = {
  businessName: "Raymond Unlock",
  tagline: "Celulares y Más",
  description:
    "Desbloqueo, reparación y venta de celulares y artículos electrónicos en Santo Domingo, República Dominicana.",
  address: "Calle México #6, casi esq. Isabel Aguiar, Santo Domingo, República Dominicana, 11005",
  addressParts: {
    street: "Calle México #6, casi esq. Isabel Aguiar",
    locality: "Santo Domingo",
    postalCode: "11005",
    country: "DO",
  },
  phoneDisplay: "809-906-3114",
  shippingNote:
    "Envíos a todo el país. Entrega en 24 h en el Distrito Nacional. Escríbenos por WhatsApp para coordinar tu envío.",
  whatsappNumber: WHATSAPP_NUMBER,
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "Raymondunlock01@gmail.com",
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/raymondunlock_/",
  threadsUrl: "https://www.threads.net/@raymondunlock_",
  facebookUrl: null,
  guarantees: [
    { icon: "truck", title: "Entrega en 24 h", text: "En el Distrito Nacional" },
    { icon: "badge-check", title: "Equipos originales", text: "Nuevos, open box y usados" },
    { icon: "wrench", title: "Garantía en reparaciones", text: "En todos nuestros servicios" },
    { icon: "message-circle", title: "Soporte por WhatsApp", text: "Escríbenos al 809-906-3114" },
  ],
  whyUs: [
    {
      icon: "badge-check",
      title: "Productos originales",
      text: "Trabajamos con equipos y accesorios de marcas reconocidas.",
    },
    {
      icon: "shield-check",
      title: "Precios competitivos",
      text: "Buen precio en unidad y todavía mejor si compras por volumen.",
    },
    {
      icon: "wrench",
      title: "Técnicos expertos",
      text: "Diagnóstico y reparación hechos por gente que sabe lo que hace.",
    },
    {
      icon: "message-circle",
      title: "Servicio postventa",
      text: "Después de la compra seguimos contigo: escríbenos cuando lo necesites.",
    },
  ],
  testimonials: [
    {
      id: "t1",
      name: "Carlos M.",
      detail: "Cliente en Santo Domingo",
      quote:
        "Me cambiaron la pantalla del iPhone el mismo día y quedó como nuevo. Me explicaron todo antes de empezar.",
    },
    {
      id: "t2",
      name: "Yesenia R.",
      detail: "Cliente en Santo Domingo Este",
      quote: "Compré mi Samsung aquí y el trato fue de primera. Me lo dejaron listo y configurado.",
    },
    {
      id: "t3",
      name: "Ramón P.",
      detail: "Dueño de negocio",
      quote:
        "Les compro accesorios al por mayor para mi tienda. Buenos precios y siempre tienen mercancía.",
    },
  ],
  navPromos: {
    celulares: {
      title: "Nuevos, open box y usados",
      subtitle: "Elige el equipo que se ajusta a tu presupuesto",
      href: "/tienda/celulares",
    },
    tablets: {
      title: "Tablets para todo",
      subtitle: "Trabajo, estudio y entretenimiento",
      href: "/tienda/tablets",
    },
    audio: {
      title: "Sonido sin cables",
      subtitle: "AirPods, Galaxy Buds y más",
      href: "/tienda/audio",
    },
    smartwatches: {
      title: "Tu día en la muñeca",
      subtitle: "Apple Watch y Galaxy Watch",
      href: "/tienda/smartwatches",
    },
    accesorios: {
      title: "Completa tu equipo",
      subtitle: "Cargadores, cases y protectores",
      href: "/tienda/accesorios",
    },
  },
};
