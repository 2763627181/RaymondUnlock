import { describe, expect, it } from "vitest";
import { unitFacts, type UnitFacts } from "@/lib/catalog/unit-facts";

const phone: UnitFacts = {
  condition: "usado",
  capacity: "128 GB",
  color: "Azul",
  batteryHealth: 92,
  unlockType: "artista",
  code: "RU-00012",
};

describe("unitFacts", () => {
  it("devuelve todos los datos en el orden de la ficha", () => {
    expect(unitFacts(phone).map((fact) => [fact.label, fact.value])).toEqual([
      ["Estado", "Usado"],
      ["Capacidad", "128 GB"],
      ["Color", "Azul"],
      ["Batería", "92 %"],
      ["Liberación", "Por artista"],
      ["Código", "RU-00012"],
    ]);
  });

  it("omite lo que el producto no tiene (una funda no lleva batería ni liberación)", () => {
    const facts = unitFacts({
      ...phone,
      capacity: null,
      batteryHealth: null,
      unlockType: null,
    });
    expect(facts.map((fact) => fact.key)).toEqual(["condition", "color", "code"]);
  });

  it("una batería de 0 % sí se muestra (no es lo mismo que sin dato)", () => {
    const facts = unitFacts({ ...phone, batteryHealth: 0 });
    expect(facts.find((fact) => fact.key === "battery")?.value).toBe("0 %");
  });
});
