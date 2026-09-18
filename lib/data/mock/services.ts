import type { Banner, Service } from "@/types/site";

/** Precios y tiempos ficticios: el dueño los reemplaza desde /admin/servicios. */
export const services: Service[] = [
  {
    id: "srv-desbloqueo",
    slug: "desbloqueo-de-celulares",
    name: "Desbloqueo de celulares",
    description:
      "Liberamos tu equipo para que lo uses con cualquier compañía. Te decimos si es posible antes de empezar.",
    icon: "lock",
    priceFrom: 1500,
    turnaround: "Mismo día",
    deviceTypes: ["iPhone", "Samsung", "Xiaomi", "Motorola"],
    sortOrder: 1,
  },
  {
    id: "srv-pantalla",
    slug: "cambio-de-pantalla",
    name: "Cambio de pantalla",
    description:
      "Pantalla rota, con líneas o sin respuesta al tacto. Diagnosticamos y te damos el precio antes de reparar.",
    icon: "smartphone",
    priceFrom: 3500,
    turnaround: "Mismo día a 24 horas",
    deviceTypes: ["iPhone", "Samsung", "Xiaomi", "Motorola", "iPad"],
    sortOrder: 2,
  },
  {
    id: "srv-bateria",
    slug: "cambio-de-bateria",
    name: "Cambio de batería",
    description:
      "Si tu celular se apaga solo o no te dura el día, una batería nueva le devuelve la autonomía.",
    icon: "battery",
    priceFrom: 1800,
    turnaround: "Mismo día",
    deviceTypes: ["iPhone", "Samsung", "Xiaomi", "Motorola", "iPad"],
    sortOrder: 3,
  },
  {
    id: "srv-pin-carga",
    slug: "cambio-de-pin-de-carga",
    name: "Cambio de pin de carga",
    description:
      "Cuando el cargador no hace contacto o el equipo no carga, revisamos y cambiamos el pin de carga.",
    icon: "plug",
    priceFrom: 1500,
    turnaround: "Mismo día",
    deviceTypes: ["iPhone", "Samsung", "Xiaomi", "Motorola"],
    sortOrder: 4,
  },
  {
    id: "srv-liquido",
    slug: "dano-por-liquido",
    name: "Daño por líquido",
    description:
      "Se mojó tu celular: apágalo y tráelo lo antes posible. Limpiamos y revisamos los componentes afectados.",
    icon: "droplets",
    priceFrom: 2000,
    turnaround: "24 a 72 horas",
    deviceTypes: ["iPhone", "Samsung", "Xiaomi", "Motorola"],
    sortOrder: 5,
  },
  {
    id: "srv-software",
    slug: "software-y-flasheo",
    name: "Software y flasheo",
    description:
      "Actualizaciones, equipos que no encienden por software, reinstalación del sistema y más.",
    icon: "cpu",
    priceFrom: 1200,
    turnaround: "Mismo día",
    deviceTypes: ["iPhone", "Samsung", "Xiaomi", "Motorola"],
    sortOrder: 6,
  },
  {
    id: "srv-cristal-trasero",
    slug: "cambio-de-cristal-trasero",
    name: "Cambio de cristal trasero",
    description:
      "¿La tapa trasera está quebrada? La reemplazamos para que tu equipo vuelva a verse bien.",
    icon: "smartphone",
    priceFrom: 2500,
    turnaround: "24 a 48 horas",
    deviceTypes: ["iPhone", "Samsung"],
    sortOrder: 7,
  },
  {
    id: "srv-camara",
    slug: "reparacion-de-camara",
    name: "Reparación de cámara",
    description:
      "Fotos borrosas, cámara que no abre o lente rota: revisamos el módulo y lo reparamos o lo cambiamos.",
    icon: "camera",
    priceFrom: 2800,
    turnaround: "24 a 48 horas",
    deviceTypes: ["iPhone", "Samsung", "Xiaomi", "Motorola"],
    sortOrder: 8,
  },
];

/** Las imágenes son ilustraciones de ejemplo; el dueño sube las reales desde /admin/banners. */
export const bannersBase: Omit<Banner, "fromPrice">[] = [
  {
    id: "bn-iphone",
    title: "iPhone 15 Pro",
    subtitle: "Titanio. Chip A17 Pro. Disponible en varias capacidades.",
    imageUrl: "/seed/hero-phone.svg",
    ctaLabel: "Comprar ahora",
    ctaHref: "/producto/iphone-15-pro",
    theme: "dark",
    sortOrder: 1,
  },
  {
    id: "bn-airpods",
    title: "AirPods Pro",
    subtitle: "Cancelación activa de ruido y estuche con USB-C.",
    imageUrl: "/seed/hero-audio.svg",
    ctaLabel: "Comprar ahora",
    ctaHref: "/producto/airpods-pro-2",
    theme: "dark",
    sortOrder: 2,
  },
  {
    id: "bn-watch",
    title: "Apple Watch Series 9",
    subtitle: "Pantalla más brillante y el chip S9.",
    imageUrl: "/seed/hero-watch.svg",
    ctaLabel: "Comprar ahora",
    ctaHref: "/producto/apple-watch-series-9",
    theme: "dark",
    sortOrder: 3,
  },
];
