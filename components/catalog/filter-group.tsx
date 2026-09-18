import type { ReactNode } from "react";

export function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-border border-b py-5 first:pt-0 last:border-b-0">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
