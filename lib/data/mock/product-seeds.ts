import "server-only";
import type { ProductCondition } from "@/types/catalog";

export interface VariantSeed {
  capacity?: string;
  color?: string;
  hex?: string;
  price: number;
  compareAt?: number;
  stock: number;
}

export interface ProductSeed {
  slug: string;
  name: string;
  categoryId: string;
  brandId: string | null;
  condition?: ProductCondition;
  short: string;
  description: string;
  specs: Record<string, string>;
  featured?: boolean;
  warranty?: string;
  wholesaleMinQty: number;
  variants: VariantSeed[];
}

/**
 * Precios y stock FICTICIOS: solo sirven para probar el sitio. El dueño los
 * reemplaza desde /admin/productos. Los precios mayoristas se derivan de estos
 * y nunca salen de módulos "server-only".
 */
export const productSeeds: ProductSeed[] = [
  {
    slug: "iphone-15-pro",
    name: "iPhone 15 Pro",
    categoryId: "cat-celulares",
    brandId: "brand-apple",
    short: "Diseño en titanio, chip A17 Pro y puerto USB-C.",
    description:
      "El iPhone 15 Pro llega con un diseño en titanio, el chip A17 Pro y cámara principal de 48 MP.\n\n- Pantalla Super Retina XDR con ProMotion\n- Puerto USB-C\n- Cámara con teleobjetivo 3x",
    specs: {
      Pantalla: '6.1" Super Retina XDR OLED, ProMotion',
      Chip: "A17 Pro",
      "Cámara principal": "48 MP",
      Conectividad: "5G, USB-C",
    },
    featured: true,
    warranty: "Consulta las condiciones de garantía de este equipo por WhatsApp.",
    wholesaleMinQty: 3,
    variants: [
      {
        capacity: "128 GB",
        color: "Titanio natural",
        hex: "#B7AFA3",
        price: 74900,
        compareAt: 79900,
        stock: 6,
      },
      { capacity: "256 GB", color: "Titanio natural", hex: "#B7AFA3", price: 84900, stock: 4 },
      { capacity: "256 GB", color: "Titanio azul", hex: "#3D4A5A", price: 84900, stock: 0 },
      { capacity: "512 GB", color: "Titanio negro", hex: "#2E2F31", price: 99900, stock: 2 },
    ],
  },
  {
    slug: "iphone-15",
    name: "iPhone 15",
    categoryId: "cat-celulares",
    brandId: "brand-apple",
    short: "Dynamic Island, cámara de 48 MP y puerto USB-C.",
    description:
      "El iPhone 15 trae la Dynamic Island, el chip A16 Bionic y una cámara principal de 48 MP.\n\n- Puerto USB-C\n- Pantalla Super Retina XDR\n- Varios colores",
    specs: {
      Pantalla: '6.1" Super Retina XDR OLED',
      Chip: "A16 Bionic",
      "Cámara principal": "48 MP",
      Conectividad: "5G, USB-C",
    },
    featured: true,
    wholesaleMinQty: 3,
    variants: [
      { capacity: "128 GB", color: "Negro", hex: "#2B2B2D", price: 62900, stock: 8 },
      { capacity: "128 GB", color: "Azul", hex: "#A9C4D9", price: 62900, stock: 5 },
      { capacity: "256 GB", color: "Rosa", hex: "#F2D3D2", price: 70900, stock: 3 },
    ],
  },
  {
    slug: "iphone-14",
    name: "iPhone 14",
    categoryId: "cat-celulares",
    brandId: "brand-apple",
    condition: "open_box",
    short: "Equipo open box con chip A15 Bionic.",
    description:
      "iPhone 14 en condición open box: caja abierta, equipo sin uso.\n\n- Chip A15 Bionic\n- Cámara dual de 12 MP\n- Detección de accidentes",
    specs: {
      Pantalla: '6.1" Super Retina XDR OLED',
      Chip: "A15 Bionic",
      "Cámara principal": "12 MP",
      Conectividad: "5G, Lightning",
    },
    wholesaleMinQty: 3,
    variants: [
      {
        capacity: "128 GB",
        color: "Medianoche",
        hex: "#26282C",
        price: 46900,
        compareAt: 52900,
        stock: 3,
      },
      { capacity: "128 GB", color: "Azul", hex: "#A7C0DC", price: 46900, stock: 2 },
    ],
  },
  {
    slug: "iphone-13",
    name: "iPhone 13",
    categoryId: "cat-celulares",
    brandId: "brand-apple",
    condition: "reacondicionado",
    short: "Reacondicionado, revisado y listo para usar.",
    description:
      "iPhone 13 reacondicionado y revisado por nuestros técnicos.\n\n- Chip A15 Bionic\n- Cámara dual de 12 MP\n- Ideal como primer iPhone",
    specs: {
      Pantalla: '6.1" Super Retina XDR OLED',
      Chip: "A15 Bionic",
      "Cámara principal": "12 MP",
      Conectividad: "5G, Lightning",
    },
    wholesaleMinQty: 3,
    variants: [
      { capacity: "128 GB", color: "Medianoche", hex: "#26282C", price: 34900, stock: 4 },
      {
        capacity: "128 GB",
        color: "Rosa",
        hex: "#F2D3D2",
        price: 34900,
        compareAt: 39900,
        stock: 2,
      },
    ],
  },
  {
    slug: "samsung-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    categoryId: "cat-celulares",
    brandId: "brand-samsung",
    short: "Marco de titanio, cámara de 200 MP y S Pen incluido.",
    description:
      "El tope de gama de Samsung con marco de titanio y S Pen integrado.\n\n- Pantalla Dynamic AMOLED 2X de 6.8 pulgadas\n- Cámara principal de 200 MP\n- Funciones Galaxy AI",
    specs: {
      Pantalla: '6.8" Dynamic AMOLED 2X',
      "Cámara principal": "200 MP",
      Extras: "S Pen incluido",
      Conectividad: "5G, USB-C",
    },
    featured: true,
    wholesaleMinQty: 3,
    variants: [
      { capacity: "256 GB", color: "Titanio negro", hex: "#2F3033", price: 82900, stock: 5 },
      { capacity: "256 GB", color: "Titanio gris", hex: "#8A8C8F", price: 82900, stock: 3 },
      { capacity: "512 GB", color: "Titanio negro", hex: "#2F3033", price: 94900, stock: 2 },
    ],
  },
  {
    slug: "samsung-galaxy-s24",
    name: "Samsung Galaxy S24",
    categoryId: "cat-celulares",
    brandId: "brand-samsung",
    short: "Compacto, potente y con Galaxy AI.",
    description:
      "Un Galaxy compacto con pantalla Dynamic AMOLED 2X y funciones Galaxy AI.\n\n- Cámara principal de 50 MP\n- Pantalla de 6.2 pulgadas\n- Carga por USB-C",
    specs: {
      Pantalla: '6.2" Dynamic AMOLED 2X',
      "Cámara principal": "50 MP",
      Conectividad: "5G, USB-C",
    },
    featured: true,
    wholesaleMinQty: 3,
    variants: [
      {
        capacity: "128 GB",
        color: "Onyx",
        hex: "#1F1F21",
        price: 54900,
        compareAt: 59900,
        stock: 6,
      },
      { capacity: "256 GB", color: "Gris mármol", hex: "#C9CACC", price: 61900, stock: 4 },
      { capacity: "256 GB", color: "Violeta cobalto", hex: "#B8A9D9", price: 61900, stock: 0 },
    ],
  },
  {
    slug: "samsung-galaxy-a55-5g",
    name: "Samsung Galaxy A55 5G",
    categoryId: "cat-celulares",
    brandId: "brand-samsung",
    short: "Pantalla Super AMOLED de 120 Hz y batería de 5,000 mAh.",
    description:
      "Gama media con pantalla Super AMOLED y batería para todo el día.\n\n- Pantalla de 6.6 pulgadas y 120 Hz\n- Cámara principal de 50 MP\n- Batería de 5,000 mAh",
    specs: {
      Pantalla: '6.6" Super AMOLED, 120 Hz',
      "Cámara principal": "50 MP",
      Batería: "5,000 mAh",
      Conectividad: "5G",
    },
    wholesaleMinQty: 5,
    variants: [
      { capacity: "128 GB", color: "Azul claro", hex: "#B9CBE0", price: 24900, stock: 10 },
      { capacity: "256 GB", color: "Negro", hex: "#2B2C2F", price: 28900, stock: 7 },
    ],
  },
  {
    slug: "xiaomi-redmi-note-13-pro",
    name: "Xiaomi Redmi Note 13 Pro",
    categoryId: "cat-celulares",
    brandId: "brand-xiaomi",
    short: "Cámara de 200 MP y pantalla AMOLED de 120 Hz.",
    description:
      "Mucho equipo por lo que cuesta: cámara de 200 MP y pantalla AMOLED fluida.\n\n- Pantalla de 6.67 pulgadas\n- Batería de 5,100 mAh\n- Carga rápida",
    specs: {
      Pantalla: '6.67" AMOLED, 120 Hz',
      "Cámara principal": "200 MP",
      Batería: "5,100 mAh",
    },
    wholesaleMinQty: 5,
    variants: [
      {
        capacity: "256 GB",
        color: "Negro medianoche",
        hex: "#1E1F22",
        price: 19900,
        compareAt: 22900,
        stock: 12,
      },
      { capacity: "256 GB", color: "Púrpura aurora", hex: "#B7A4D6", price: 19900, stock: 6 },
      { capacity: "256 GB", color: "Turquesa océano", hex: "#7FBFC0", price: 19900, stock: 4 },
    ],
  },
  {
    slug: "google-pixel-8",
    name: "Google Pixel 8",
    categoryId: "cat-celulares",
    brandId: "brand-google",
    short: "Chip Tensor G3 y años de actualizaciones de Google.",
    description:
      "El Pixel 8 con el chip Tensor G3 y las funciones de fotografía de Google.\n\n- Pantalla Actua OLED de 6.2 pulgadas\n- Cámara principal de 50 MP\n- Siete años de actualizaciones",
    specs: {
      Pantalla: '6.2" Actua OLED, 120 Hz',
      Chip: "Google Tensor G3",
      "Cámara principal": "50 MP",
    },
    wholesaleMinQty: 3,
    variants: [
      { capacity: "128 GB", color: "Obsidiana", hex: "#232326", price: 42900, stock: 3 },
      { capacity: "256 GB", color: "Avellana", hex: "#A8AD9B", price: 47900, stock: 2 },
    ],
  },
  {
    slug: "motorola-moto-g84-5g",
    name: "Motorola Moto G84 5G",
    categoryId: "cat-celulares",
    brandId: "brand-motorola",
    short: "Pantalla pOLED de 120 Hz y 5G a buen precio.",
    description:
      "Un Moto con pantalla pOLED y 5G para el día a día.\n\n- Pantalla de 6.5 pulgadas y 120 Hz\n- Cámara principal de 50 MP con estabilizador\n- Batería de 5,000 mAh",
    specs: {
      Pantalla: '6.5" pOLED, 120 Hz',
      "Cámara principal": "50 MP",
      Batería: "5,000 mAh",
      Conectividad: "5G",
    },
    wholesaleMinQty: 5,
    variants: [
      { capacity: "256 GB", color: "Azul medianoche", hex: "#1D2A4A", price: 16900, stock: 9 },
      { capacity: "256 GB", color: "Magenta", hex: "#B0315F", price: 16900, stock: 5 },
    ],
  },
  {
    slug: "ipad-10-generacion",
    name: "iPad (10.ª generación)",
    categoryId: "cat-tablets",
    brandId: "brand-apple",
    short: "Pantalla Liquid Retina de 10.9 pulgadas y USB-C.",
    description:
      "El iPad para todos los días: estudiar, trabajar y ver contenido.\n\n- Pantalla Liquid Retina de 10.9 pulgadas\n- Chip A14 Bionic\n- Puerto USB-C",
    specs: {
      Pantalla: '10.9" Liquid Retina',
      Chip: "A14 Bionic",
      Conectividad: "Wi-Fi, USB-C",
    },
    featured: true,
    wholesaleMinQty: 3,
    variants: [
      { capacity: "64 GB", color: "Azul", hex: "#9DB8D6", price: 27900, stock: 5 },
      { capacity: "64 GB", color: "Plata", hex: "#E2E3E5", price: 27900, stock: 3 },
      { capacity: "256 GB", color: "Plata", hex: "#E2E3E5", price: 38900, stock: 2 },
    ],
  },
  {
    slug: "ipad-air-m2",
    name: "iPad Air (M2)",
    categoryId: "cat-tablets",
    brandId: "brand-apple",
    short: "Chip M2 en un iPad delgado y ligero.",
    description:
      "Potencia del chip M2 en un formato ligero.\n\n- Pantalla Liquid Retina de 11 pulgadas\n- Chip M2\n- Compatible con Apple Pencil",
    specs: {
      Pantalla: '11" Liquid Retina',
      Chip: "Apple M2",
      Conectividad: "Wi-Fi, USB-C",
    },
    wholesaleMinQty: 3,
    variants: [
      { capacity: "128 GB", color: "Gris espacial", hex: "#5A5B5E", price: 49900, stock: 3 },
      { capacity: "256 GB", color: "Azul", hex: "#9DB2D3", price: 56900, stock: 2 },
    ],
  },
  {
    slug: "samsung-galaxy-tab-s9-fe",
    name: "Samsung Galaxy Tab S9 FE",
    categoryId: "cat-tablets",
    brandId: "brand-samsung",
    short: "Resistente al agua y con S Pen incluido.",
    description:
      "Una tablet Android versátil con S Pen incluido y resistencia al agua y al polvo.\n\n- Pantalla de 10.9 pulgadas\n- Certificación IP68\n- S Pen incluido",
    specs: {
      Pantalla: '10.9" LCD, 90 Hz',
      Resistencia: "IP68",
      Extras: "S Pen incluido",
    },
    wholesaleMinQty: 3,
    variants: [
      {
        capacity: "128 GB",
        color: "Gris",
        hex: "#7C7E82",
        price: 27900,
        compareAt: 30900,
        stock: 4,
      },
      { capacity: "256 GB", color: "Menta", hex: "#B8DDCB", price: 32900, stock: 2 },
    ],
  },
  {
    slug: "airpods-pro-2",
    name: "AirPods Pro (2.ª generación)",
    categoryId: "cat-audio",
    brandId: "brand-apple",
    short: "Cancelación activa de ruido y estuche con USB-C.",
    description:
      "Los AirPods Pro con cancelación activa de ruido y audio adaptativo.\n\n- Chip H2\n- Estuche de carga con USB-C\n- Resistencia al agua y al polvo IP54",
    specs: {
      Cancelación: "Cancelación activa de ruido",
      Chip: "H2",
      Carga: "Estuche USB-C",
    },
    featured: true,
    wholesaleMinQty: 5,
    variants: [{ color: "Blanco", hex: "#F4F4F5", price: 15900, stock: 12 }],
  },
  {
    slug: "airpods-3-generacion",
    name: "AirPods (3.ª generación)",
    categoryId: "cat-audio",
    brandId: "brand-apple",
    short: "Audio espacial y hasta 6 horas de reproducción.",
    description:
      "AirPods con diseño ergonómico y audio espacial.\n\n- Hasta 6 horas de reproducción\n- Resistencia al sudor y al agua IPX4\n- Estuche de carga MagSafe",
    specs: {
      Audio: "Audio espacial",
      Resistencia: "IPX4",
      Autonomía: "Hasta 6 horas",
    },
    wholesaleMinQty: 5,
    variants: [{ color: "Blanco", hex: "#F4F4F5", price: 12900, compareAt: 13900, stock: 8 }],
  },
  {
    slug: "airpods-max",
    name: "AirPods Max",
    categoryId: "cat-audio",
    brandId: "brand-apple",
    short: "Audífonos over-ear con cancelación activa de ruido.",
    description:
      "Audífonos de diadema con cancelación activa de ruido y audio espacial.\n\n- Hasta 20 horas de reproducción\n- Almohadillas de espuma viscoelástica\n- Varios colores",
    specs: {
      Tipo: "Over-ear inalámbricos",
      Cancelación: "Cancelación activa de ruido",
      Autonomía: "Hasta 20 horas",
    },
    wholesaleMinQty: 3,
    variants: [
      { color: "Gris espacial", hex: "#5B5C60", price: 38900, stock: 3 },
      { color: "Plata", hex: "#DADCDF", price: 38900, stock: 2 },
      { color: "Azul cielo", hex: "#A8C4DC", price: 38900, stock: 0 },
      { color: "Verde", hex: "#B7D4C2", price: 38900, stock: 1 },
    ],
  },
  {
    slug: "samsung-galaxy-buds2-pro",
    name: "Samsung Galaxy Buds2 Pro",
    categoryId: "cat-audio",
    brandId: "brand-samsung",
    short: "Cancelación de ruido y audio de alta resolución.",
    description:
      "Los Buds2 Pro con cancelación activa de ruido y sonido de 24 bits.\n\n- Resistencia al agua IPX7\n- Diseño ergonómico\n- Estuche de carga",
    specs: {
      Cancelación: "Cancelación activa de ruido",
      Audio: "24 bits",
      Resistencia: "IPX7",
    },
    wholesaleMinQty: 5,
    variants: [
      { color: "Grafito", hex: "#333437", price: 9900, compareAt: 11900, stock: 7 },
      { color: "Blanco", hex: "#F1F1F2", price: 9900, stock: 5 },
      { color: "Púrpura bora", hex: "#C7B8E0", price: 9900, stock: 3 },
    ],
  },
  {
    slug: "jbl-tune-520bt",
    name: "JBL Tune 520BT",
    categoryId: "cat-audio",
    brandId: "brand-jbl",
    short: "Audífonos inalámbricos con hasta 57 horas de batería.",
    description:
      "Audífonos on-ear con el sonido JBL Pure Bass.\n\n- Hasta 57 horas de reproducción\n- Bluetooth 5.3\n- Plegables y livianos",
    specs: {
      Tipo: "On-ear inalámbricos",
      Autonomía: "Hasta 57 horas",
      Conectividad: "Bluetooth 5.3",
    },
    wholesaleMinQty: 10,
    variants: [
      { color: "Negro", hex: "#232326", price: 3900, stock: 15 },
      { color: "Blanco", hex: "#F1F1F2", price: 3900, stock: 9 },
      { color: "Azul", hex: "#3B6EA5", price: 3900, stock: 6 },
    ],
  },
  {
    slug: "apple-watch-series-9",
    name: "Apple Watch Series 9",
    categoryId: "cat-smartwatches",
    brandId: "brand-apple",
    short: "Chip S9 y pantalla más brillante.",
    description:
      "El Apple Watch Series 9 con el chip S9 y el gesto de doble toque.\n\n- Pantalla siempre activa\n- Seguimiento de actividad y salud\n- Resistente al agua",
    specs: {
      Chip: "S9 SiP",
      Pantalla: "Retina siempre activa",
      Extras: "Gesto de doble toque",
    },
    featured: true,
    wholesaleMinQty: 3,
    variants: [
      { capacity: "41 mm", color: "Medianoche", hex: "#26292E", price: 27900, stock: 4 },
      { capacity: "45 mm", color: "Medianoche", hex: "#26292E", price: 30900, stock: 3 },
      { capacity: "45 mm", color: "Blanco estelar", hex: "#E8E1D5", price: 30900, stock: 0 },
    ],
  },
  {
    slug: "apple-watch-se-2",
    name: "Apple Watch SE (2.ª generación)",
    categoryId: "cat-smartwatches",
    brandId: "brand-apple",
    short: "Lo esencial del Apple Watch a mejor precio.",
    description:
      "El Apple Watch SE ofrece seguimiento de actividad, notificaciones y detección de choques.\n\n- Pantalla Retina\n- Resistente al agua\n- Detección de choques",
    specs: {
      Chip: "S8 SiP",
      Extras: "Detección de choques",
    },
    wholesaleMinQty: 3,
    variants: [
      { capacity: "40 mm", color: "Medianoche", hex: "#26292E", price: 17900, stock: 5 },
      {
        capacity: "44 mm",
        color: "Medianoche",
        hex: "#26292E",
        price: 19900,
        compareAt: 21900,
        stock: 4,
      },
    ],
  },
  {
    slug: "samsung-galaxy-watch6",
    name: "Samsung Galaxy Watch6",
    categoryId: "cat-smartwatches",
    brandId: "brand-samsung",
    short: "Wear OS, pantalla Super AMOLED y seguimiento de salud.",
    description:
      "El Galaxy Watch6 con Wear OS y una pantalla Super AMOLED más grande.\n\n- Seguimiento de sueño y ejercicio\n- Compatible con teléfonos Android\n- Resistente al agua",
    specs: {
      Sistema: "Wear OS",
      Pantalla: "Super AMOLED",
    },
    wholesaleMinQty: 3,
    variants: [
      { capacity: "40 mm", color: "Grafito", hex: "#3A3B3E", price: 15900, stock: 4 },
      { capacity: "44 mm", color: "Plata", hex: "#D9DADC", price: 17900, stock: 3 },
    ],
  },
  {
    slug: "cargador-rapido-usb-c-20w",
    name: "Cargador rápido USB-C 20W",
    categoryId: "cat-cargadores",
    brandId: null,
    short: "Carga rápida para iPhone, iPad y Android con USB-C.",
    description:
      "Cargador de pared compacto con salida USB-C de 20 W.\n\n- Carga rápida\n- Tamaño compacto\n- Compatible con equipos USB-C",
    specs: {
      Potencia: "20 W",
      Puerto: "USB-C",
    },
    wholesaleMinQty: 20,
    variants: [{ color: "Blanco", hex: "#F4F4F5", price: 1190, stock: 40 }],
  },
  {
    slug: "cable-usb-c-a-lightning",
    name: "Cable USB-C a Lightning",
    categoryId: "cat-cargadores",
    brandId: null,
    short: "Carga y sincroniza tu iPhone.",
    description:
      "Cable USB-C a Lightning para cargar y sincronizar.\n\n- Compatible con carga rápida\n- Disponible en 1 y 2 metros",
    specs: {
      Conectores: "USB-C a Lightning",
    },
    wholesaleMinQty: 20,
    variants: [
      { capacity: "1 m", color: "Blanco", hex: "#F4F4F5", price: 890, stock: 50 },
      { capacity: "2 m", color: "Blanco", hex: "#F4F4F5", price: 1190, stock: 30 },
    ],
  },
  {
    slug: "case-spigen-ultra-hybrid-iphone-15",
    name: "Case Spigen Ultra Hybrid para iPhone 15",
    categoryId: "cat-cases",
    brandId: "brand-spigen",
    short: "Case transparente con esquinas reforzadas.",
    description:
      "Case transparente que deja ver el color de tu iPhone.\n\n- Esquinas con tecnología Air Cushion\n- Bordes elevados para proteger pantalla y cámara",
    specs: {
      Material: "Policarbonato y TPU",
      Acabado: "Transparente",
    },
    wholesaleMinQty: 10,
    variants: [
      { capacity: "iPhone 15", color: "Transparente", hex: "#D8DCE2", price: 1490, stock: 14 },
      { capacity: "iPhone 15 Pro", color: "Transparente", hex: "#D8DCE2", price: 1590, stock: 9 },
      {
        capacity: "iPhone 15 Pro Max",
        color: "Transparente",
        hex: "#D8DCE2",
        price: 1690,
        stock: 6,
      },
    ],
  },
  {
    slug: "power-bank-anker-10000-mah",
    name: "Power bank Anker 10,000 mAh",
    categoryId: "cat-accesorios",
    brandId: "brand-anker",
    short: "Batería portátil de 10,000 mAh.",
    description:
      "Batería externa compacta para cargar tu celular fuera de casa.\n\n- Capacidad de 10,000 mAh\n- Tamaño de bolsillo",
    specs: {
      Capacidad: "10,000 mAh",
    },
    wholesaleMinQty: 10,
    variants: [
      { color: "Negro", hex: "#232326", price: 2900, stock: 18 },
      { color: "Blanco", hex: "#F1F1F2", price: 2900, stock: 10 },
    ],
  },
  {
    slug: "microsd-samsung-evo-select",
    name: "Memoria microSD Samsung EVO Select",
    categoryId: "cat-accesorios",
    brandId: "brand-samsung",
    short: "Tarjeta microSD Clase 10 con adaptador.",
    description:
      "Tarjeta microSD para ampliar el almacenamiento de tu celular, cámara o consola.\n\n- Clase 10, U3\n- Incluye adaptador SD",
    specs: {
      Clase: "10, U3",
      Incluye: "Adaptador SD",
    },
    wholesaleMinQty: 10,
    variants: [
      { capacity: "64 GB", price: 890, stock: 25 },
      { capacity: "128 GB", price: 1290, stock: 20 },
      { capacity: "256 GB", price: 2190, stock: 8 },
    ],
  },
  {
    slug: "bocina-bluetooth-jbl-go-3",
    name: "Bocina Bluetooth JBL Go 3",
    categoryId: "cat-electronicos",
    brandId: "brand-jbl",
    short: "Bocina portátil resistente al agua y al polvo.",
    description:
      "Bocina Bluetooth pequeña con mucho sonido.\n\n- Resistencia IP67\n- Hasta 5 horas de reproducción\n- Correa integrada",
    specs: {
      Resistencia: "IP67",
      Autonomía: "Hasta 5 horas",
      Conectividad: "Bluetooth",
    },
    wholesaleMinQty: 5,
    variants: [
      { color: "Negro", hex: "#232326", price: 3490, compareAt: 3990, stock: 16 },
      { color: "Azul", hex: "#3B6EA5", price: 3490, stock: 8 },
      { color: "Rojo", hex: "#C8323A", price: 3490, stock: 5 },
    ],
  },
];
