import { describe, expect, it } from "vitest";
import { wholesaleContactSchema, wholesaleProductSchema } from "./wholesale";

const product = {
  name: "M-Horse S26 Ultra Max 4G 4Gb/64Gb",
  type: "Celulares",
  category: "M-HORSE",
  condition: "NUEVO",
  price: "5,100",
  isActive: true,
};

describe("wholesaleProductSchema", () => {
  it("acepta un producto y convierte el precio a número", () => {
    const parsed = wholesaleProductSchema.parse(product);
    expect(parsed.price).toBe(5100);
    expect(parsed.imageUrl).toBeUndefined();
  });

  it("exige nombre, tipo, categoría, condición y un precio válido", () => {
    for (const bad of [
      { name: "A" },
      { type: "" },
      { category: "   " },
      { condition: "" },
      { price: "" },
      { price: "-5" },
      { price: "abc" },
    ]) {
      expect(wholesaleProductSchema.safeParse({ ...product, ...bad }).success).toBe(false);
    }
  });

  it("la imagen es opcional y solo se aceptan rutas del sitio", () => {
    expect(wholesaleProductSchema.parse({ ...product, imageUrl: "" }).imageUrl).toBeUndefined();
    expect(wholesaleProductSchema.parse({ ...product, imageUrl: "/seed/x.svg" }).imageUrl).toBe(
      "/seed/x.svg",
    );
    expect(
      wholesaleProductSchema.safeParse({ ...product, imageUrl: "https://malo.example/a.png" })
        .success,
    ).toBe(false);
  });

  it("acepta su propia salida (el formulario envía al servidor lo que ya procesó)", () => {
    const first = wholesaleProductSchema.parse(product);
    expect(wholesaleProductSchema.parse(first)).toEqual(first);
  });
});

describe("wholesaleContactSchema", () => {
  const contact = { label: "Ventas 1", personName: "Ashley", isActive: true };

  it.each([
    ["809-712-3062", "18097123062"],
    ["(809) 712 3062", "18097123062"],
    ["+1 (809) 712-3062", "18097123062"],
    ["18097123062", "18097123062"],
  ])("el WhatsApp %s se guarda como %s", (input, expected) => {
    expect(wholesaleContactSchema.parse({ ...contact, whatsapp: input }).whatsapp).toBe(expected);
  });

  it("rechaza números incompletos o con letras", () => {
    for (const whatsapp of ["", "712-3062", "abc", "1234567890123456"]) {
      expect(wholesaleContactSchema.safeParse({ ...contact, whatsapp }).success).toBe(false);
    }
  });

  it("el nombre de la persona es opcional y la etiqueta obligatoria", () => {
    expect(
      wholesaleContactSchema.parse({ label: "Ventas 2", whatsapp: "8092223333", isActive: true })
        .personName,
    ).toBeUndefined();
    expect(
      wholesaleContactSchema.safeParse({ ...contact, label: "", whatsapp: "8092223333" }).success,
    ).toBe(false);
  });

  it("acepta su propia salida", () => {
    const first = wholesaleContactSchema.parse({ ...contact, whatsapp: "809-712-3062" });
    expect(wholesaleContactSchema.parse(first)).toEqual(first);
  });
});
