import { unitFacts, type UnitFacts } from "@/lib/catalog/unit-facts";

/**
 * Datos del equipo elegido. Capacidad y color ya se ven en el selector; aquí van
 * los que el cliente no puede deducir: estado, batería, liberación y el código
 * con el que puede pedirlo.
 */
export function UnitDetails({ facts }: { facts: UnitFacts }) {
  const rows = unitFacts(facts).filter((fact) => fact.key !== "capacity" && fact.key !== "color");
  if (rows.length === 0) return null;

  return (
    <dl className="border-border grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border p-4 text-sm">
      {rows.map((fact) => (
        <div key={fact.key} className="contents">
          <dt className="text-muted-foreground">{fact.label}</dt>
          <dd className="font-medium">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
