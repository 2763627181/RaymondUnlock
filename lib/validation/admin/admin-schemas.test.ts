import { describe, expect, it } from "vitest";
import { isAllowedImageUrl } from "@/lib/admin/image-url";
import { SETTING_SCHEMAS, isSettingKey } from "@/lib/validation/settings";
import { bannerSchema, serviceSchema } from "./content";
import { productSchema, variantSchema } from "./product";
import { categorySchema } from "./taxonomy";

const variant = {
  priceRetail: "74,900.50",
  stock: "6",
  isActive: true,
};

const category = "5b1b7c1e-0f5a-4a55-9c1e-6a7f3f6d2b10";

const product = {
  name: "iPhone 15 Pro",
  slug: "iphone-15-pro",
  categoryId: category,
  brandId: "",
  condition: "nuevo" as const,
  specs: [{ key: "Chip", value: "A17 Pro" }],
  isActive: true,
  isFeatured: false,
  variants: [variant],
};

describe("variantSchema", () => {
  it("acepta dinero con comas de miles y decimales", () => {
    const parsed = variantSchema.parse(variant);
    expect(parsed.priceRetail).toBe(74900.5);
  });

  it("acepta los valores ya numéricos (el servidor recibe el resultado del formulario)", () => {
    const first = variantSchema.parse(variant);
    expect(variantSchema.parse(first)).toEqual(first);
  });

  it("el precio tachado debe ser mayor que el de unidad", () => {
    expect(variantSchema.safeParse({ ...variant, compareAtPrice: "70000" }).success).toBe(false);
    expect(variantSchema.safeParse({ ...variant, compareAtPrice: "79900" }).success).toBe(true);
  });

  it("rechaza montos negativos, texto y enteros no válidos", () => {
    expect(variantSchema.safeParse({ ...variant, priceRetail: "-1" }).success).toBe(false);
    expect(variantSchema.safeParse({ ...variant, priceRetail: "abc" }).success).toBe(false);
    expect(variantSchema.safeParse({ ...variant, priceRetail: "" }).success).toBe(false);
    expect(variantSchema.safeParse({ ...variant, stock: "1.5" }).success).toBe(false);
  });

  it("valida el color #RRGGBB y deja vacío lo que no se escribe", () => {
    expect(variantSchema.parse({ ...variant, colorHex: "" }).colorHex).toBeUndefined();
    expect(variantSchema.parse({ ...variant, colorHex: "#B7AFA3" }).colorHex).toBe("#B7AFA3");
    expect(variantSchema.safeParse({ ...variant, colorHex: "azul" }).success).toBe(false);
  });

  it("la batería es un entero de 0 a 100 y vacío significa sin dato", () => {
    expect(variantSchema.parse({ ...variant, batteryHealth: "" }).batteryHealth).toBeUndefined();
    expect(variantSchema.parse(variant).batteryHealth).toBeUndefined();
    expect(variantSchema.parse({ ...variant, batteryHealth: "92" }).batteryHealth).toBe(92);
    expect(variantSchema.parse({ ...variant, batteryHealth: 0 }).batteryHealth).toBe(0);
    for (const invalid of ["101", "-1", "9.5", "alta"]) {
      expect(variantSchema.safeParse({ ...variant, batteryHealth: invalid }).success).toBe(false);
    }
  });

  it("la liberación solo acepta factory o artista; vacío es sin dato", () => {
    expect(variantSchema.parse({ ...variant, unlockType: "" }).unlockType).toBeUndefined();
    expect(variantSchema.parse({ ...variant, unlockType: "factory" }).unlockType).toBe("factory");
    expect(variantSchema.parse({ ...variant, unlockType: "artista" }).unlockType).toBe("artista");
    expect(variantSchema.safeParse({ ...variant, unlockType: "carrier" }).success).toBe(false);
  });
});

describe("productSchema", () => {
  it("acepta un producto válido y convierte la marca vacía en null", () => {
    const parsed = productSchema.parse(product);
    expect(parsed.brandId).toBeNull();
    expect(parsed.variants).toHaveLength(1);
  });

  it("exige al menos una variante y un slug válido", () => {
    expect(productSchema.safeParse({ ...product, variants: [] }).success).toBe(false);
    expect(productSchema.safeParse({ ...product, slug: "Mal Slug" }).success).toBe(false);
  });

  it("rechaza SKU repetido dentro del producto (sin distinguir mayúsculas)", () => {
    const result = productSchema.safeParse({
      ...product,
      variants: [
        { ...variant, sku: "RU-1" },
        { ...variant, sku: "ru-1" },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("categorías, servicios y banners", () => {
  it("la categoría solo acepta iconos de la lista cerrada", () => {
    const base = { name: "Audio", slug: "audio", parentId: "", isActive: true };
    expect(categorySchema.safeParse({ ...base, icon: "headphones" }).success).toBe(true);
    expect(categorySchema.safeParse({ ...base, icon: "no-existe" }).success).toBe(false);
    expect(categorySchema.parse({ ...base, icon: "" }).icon).toBeUndefined();
  });

  it("el servicio convierte los equipos separados por comas en lista", () => {
    const parsed = serviceSchema.parse({
      name: "Cambio de pantalla",
      slug: "cambio-de-pantalla",
      icon: "",
      deviceTypes: "iPhone, Samsung ,, Xiaomi",
      priceFrom: "3,500",
      isActive: true,
    });
    expect(parsed.deviceTypes).toEqual(["iPhone", "Samsung", "Xiaomi"]);
    expect(parsed.priceFrom).toBe(3500);
  });

  it("el banner solo acepta enlaces internos o https", () => {
    const base = {
      title: "Oferta",
      imageUrl: "/seed/hero.svg",
      theme: "dark" as const,
      isActive: true,
    };
    expect(bannerSchema.safeParse({ ...base, ctaHref: "/tienda" }).success).toBe(true);
    expect(bannerSchema.safeParse({ ...base, ctaHref: "https://raymondunlock.com" }).success).toBe(
      true,
    );
    expect(bannerSchema.safeParse({ ...base, ctaHref: "javascript:alert(1)" }).success).toBe(false);
    expect(bannerSchema.safeParse({ ...base, ctaHref: "//evil.com" }).success).toBe(false);
    expect(
      bannerSchema.safeParse({ ...base, imageUrl: "data:image/png;base64,AAAA" }).success,
    ).toBe(false);
  });
});

describe("ajustes", () => {
  it("reconoce solo las claves conocidas", () => {
    expect(isSettingKey("business")).toBe(true);
    expect(isSettingKey("hours")).toBe(true);
    expect(isSettingKey("admin_secret")).toBe(false);
  });

  it("el WhatsApp exige dígitos con código de país", () => {
    const business = {
      businessName: "Raymond Unlock",
      tagline: "Celulares y Más",
      description: "Tienda",
      address: "Calle México #6",
      addressParts: {
        street: "Calle México #6",
        locality: "Santo Domingo",
        postalCode: "11005",
        country: "DO",
      },
      phoneDisplay: "809-906-3114",
      shippingNote: "Envíos a todo el país",
      whatsappNumber: "18099063114",
      email: "info@example.com",
      instagramUrl: "https://www.instagram.com/raymondunlock_/",
      threadsUrl: "https://www.threads.net/@raymondunlock_",
      facebookUrl: "",
    };
    expect(SETTING_SCHEMAS.business.parse(business).facebookUrl).toBeNull();
    expect(
      SETTING_SCHEMAS.business.safeParse({ ...business, whatsappNumber: "809-906-3114" }).success,
    ).toBe(false);
    expect(
      SETTING_SCHEMAS.business.safeParse({ ...business, facebookUrl: "http://facebook.com/x" })
        .success,
    ).toBe(false);
  });

  it("el teléfono del local es opcional y se normaliza", () => {
    const business = {
      businessName: "Raymond Unlock",
      tagline: "Celulares y Más",
      description: "Tienda",
      address: "Calle México #6",
      addressParts: {
        street: "Calle México #6",
        locality: "Santo Domingo",
        postalCode: "11005",
        country: "DO",
      },
      phoneDisplay: "809-906-3114",
      shippingNote: "Envíos a todo el país",
      whatsappNumber: "18099063114",
      email: "info@example.com",
      instagramUrl: "https://www.instagram.com/raymondunlock_/",
      threadsUrl: "https://www.threads.net/@raymondunlock_",
    };
    const parse = (localPhone?: string | null) =>
      SETTING_SCHEMAS.business.safeParse({ ...business, localPhone });

    // Las filas guardadas antes de existir el campo siguen siendo válidas.
    expect(SETTING_SCHEMAS.business.parse(business).localPhone).toBeNull();
    expect(parse("").data?.localPhone).toBeNull();
    expect(parse(null).data?.localPhone).toBeNull();
    expect(parse("829-688-3114").data?.localPhone).toBe("829-688-3114");
    expect(parse("8296883114").data?.localPhone).toBe("829-688-3114");
    expect(parse("+1 (829) 688-3114").data?.localPhone).toBe("829-688-3114");
    expect(parse("305-555-0100").success).toBe(false);
    expect(parse("688-3114").success).toBe(false);
  });
});

describe("idempotencia (el formulario envía al servidor su propia salida)", () => {
  it("producto con marca vacía, color vacío y valores numéricos", () => {
    const first = productSchema.parse({ ...product, variants: [{ ...variant, colorHex: "" }] });
    expect(productSchema.parse(first)).toEqual(first);
  });

  it("variante con batería y liberación (y con ambas vacías)", () => {
    for (const extra of [
      { batteryHealth: "92", unlockType: "artista" },
      { batteryHealth: "", unlockType: "" },
    ]) {
      const first = productSchema.parse({ ...product, variants: [{ ...variant, ...extra }] });
      expect(productSchema.parse(first)).toEqual(first);
    }
  });

  it("servicio con equipos como lista", () => {
    const first = serviceSchema.parse({
      name: "Cambio de pantalla",
      slug: "cambio-de-pantalla",
      icon: "",
      deviceTypes: "iPhone, Samsung",
      isActive: true,
    });
    expect(serviceSchema.parse(first)).toEqual(first);
  });

  it("banner sin enlace y categoría sin padre ni icono", () => {
    const banner = bannerSchema.parse({
      title: "Oferta",
      imageUrl: "/x.svg",
      theme: "light",
      isActive: true,
    });
    expect(bannerSchema.parse(banner)).toEqual(banner);
    const cat = categorySchema.parse({
      name: "Audio",
      slug: "audio",
      parentId: "",
      icon: "",
      isActive: true,
    });
    expect(categorySchema.parse(cat)).toEqual(cat);
  });

  it("datos del negocio sin Facebook", () => {
    const first = SETTING_SCHEMAS.business.parse({
      businessName: "Raymond Unlock",
      tagline: "Celulares y Más",
      description: "Tienda",
      address: "Calle México #6",
      addressParts: {
        street: "Calle México #6",
        locality: "Santo Domingo",
        postalCode: "11005",
        country: "DO",
      },
      phoneDisplay: "809-906-3114",
      shippingNote: "Envíos",
      whatsappNumber: "18099063114",
      email: "info@example.com",
      instagramUrl: "https://www.instagram.com/raymondunlock_/",
      threadsUrl: "https://www.threads.net/@raymondunlock_",
      facebookUrl: "",
    });
    expect(SETTING_SCHEMAS.business.parse(first)).toEqual(first);
  });
});

describe("imágenes permitidas", () => {
  it("solo rutas del sitio o el bucket público de este proyecto", () => {
    const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
    try {
      expect(isAllowedImageUrl("/seed/phone.svg")).toBe(true);
      expect(
        isAllowedImageUrl("https://abc.supabase.co/storage/v1/object/public/products/p/a.webp"),
      ).toBe(true);
      expect(isAllowedImageUrl("https://evil.com/a.png")).toBe(false);
      expect(isAllowedImageUrl("//evil.com/a.png")).toBe(false);
      expect(isAllowedImageUrl("https://abc.supabase.co/storage/v1/object/public/otro/a.png")).toBe(
        false,
      );
      expect(
        isAllowedImageUrl("http://abc.supabase.co/storage/v1/object/public/products/a.png"),
      ).toBe(false);
      expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = original;
    }
  });

  it("un producto no admite dos especificaciones con el mismo nombre", () => {
    const result = productSchema.safeParse({
      ...product,
      specs: [
        { key: "Chip", value: "A17" },
        { key: "chip", value: "A18" },
      ],
    });
    expect(result.success).toBe(false);
  });
});
