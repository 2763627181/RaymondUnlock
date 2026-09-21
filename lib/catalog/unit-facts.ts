import { CONDITION_LABELS, UNLOCK_LABELS, formatBattery } from "@/lib/catalog/text";
import type { CatalogVariant, ProductCondition } from "@/types/catalog";

export type UnitFactKey = "condition" | "capacity" | "color" | "battery" | "unlock" | "code";

export interface UnitFact {
  key: UnitFactKey;
  label: string;
  value: string;
}

/** Lo que se sabe de un equipo concreto: estado del producto + datos de su variante. */
export interface UnitFacts extends Pick<
  CatalogVariant,
  "capacity" | "color" | "batteryHealth" | "unlockType"
> {
  condition: ProductCondition | null;
  /** SKU de la variante: el código con el que se pide y se busca. */
  code: string | null;
}

/**
 * Datos del equipo en el orden en que se muestran y se mandan por WhatsApp.
 * Lo que no tiene valor (una funda no tiene batería) simplemente no aparece.
 */
export function unitFacts(facts: UnitFacts): UnitFact[] {
  const entries: (UnitFact | null)[] = [
    facts.condition
      ? { key: "condition", label: "Estado", value: CONDITION_LABELS[facts.condition] }
      : null,
    facts.capacity ? { key: "capacity", label: "Capacidad", value: facts.capacity } : null,
    facts.color ? { key: "color", label: "Color", value: facts.color } : null,
    facts.batteryHealth !== null
      ? { key: "battery", label: "Batería", value: formatBattery(facts.batteryHealth) }
      : null,
    facts.unlockType
      ? { key: "unlock", label: "Liberación", value: UNLOCK_LABELS[facts.unlockType] }
      : null,
    facts.code ? { key: "code", label: "Código", value: facts.code } : null,
  ];
  return entries.filter((entry): entry is UnitFact => entry !== null);
}
