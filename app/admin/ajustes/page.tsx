import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import type { z } from "zod";
import { BusinessSettingsForm } from "@/components/admin/business-settings-form";
import { ListSettingsForm } from "@/components/admin/list-settings-form";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/admin";
import { createSessionClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { SETTING_SCHEMAS } from "@/lib/validation/settings";

export const metadata: Metadata = { title: "Ajustes" };

const SECTIONS = [
  { value: "negocio", label: "Negocio" },
  { value: "horarios", label: "Horarios" },
  { value: "garantias", label: "Garantías" },
  { value: "por-que", label: "Por qué nosotros" },
  { value: "reparacion", label: "Proceso de reparación" },
  { value: "testimonios", label: "Testimonios" },
  { value: "menu", label: "Promos del menú" },
] as const;

/** Lee una sección; si falta usa el valor por defecto, y si está mal formada lo avisa. */
function read<S extends z.ZodType>(
  values: Map<string, unknown>,
  key: string,
  schema: S,
  fallback: z.output<S>,
): { value: z.output<S>; invalid: boolean } {
  if (!values.has(key)) return { value: fallback, invalid: false };
  const parsed = schema.safeParse(values.get(key));
  return parsed.success
    ? { value: parsed.data, invalid: false }
    : { value: fallback, invalid: true };
}

const EMPTY_BUSINESS = {
  businessName: "",
  tagline: "",
  description: "",
  address: "",
  addressParts: { street: "", locality: "", postalCode: "", country: "DO" },
  phoneDisplay: "",
  localPhone: null,
  shippingNote: "",
  whatsappNumber: "",
  email: "",
  instagramUrl: "",
  threadsUrl: "",
  facebookUrl: null,
};

export default async function AdminSettingsPage(props: PageProps<"/admin/ajustes">) {
  await requireAdmin("/admin/ajustes");
  const { seccion } = await props.searchParams;
  const requested = Array.isArray(seccion) ? seccion[0] : seccion;
  const section = SECTIONS.find((item) => item.value === requested) ?? SECTIONS[0];

  const { data } = await (await createSessionClient()).from("site_settings").select("key, value");
  const values = new Map<string, unknown>((data ?? []).map((row) => [row.key, row.value]));
  const schemas = SETTING_SCHEMAS;

  let content: ReactNode;
  let invalid = false;

  switch (section.value) {
    case "negocio": {
      const business = read(values, "business", schemas.business, EMPTY_BUSINESS);
      invalid = business.invalid;
      content = <BusinessSettingsForm initial={business.value} />;
      break;
    }
    case "horarios": {
      const hours = read(values, "hours", schemas.hours, []);
      invalid = hours.invalid;
      content = <ListSettingsForm settingKey="hours" initialRows={hours.value} />;
      break;
    }
    case "garantias": {
      const stored = read(values, "guarantees", schemas.guarantees, []);
      invalid = stored.invalid;
      content = <ListSettingsForm settingKey="guarantees" initialRows={stored.value} />;
      break;
    }
    case "por-que": {
      const stored = read(values, "why_us", schemas.why_us, []);
      invalid = stored.invalid;
      content = <ListSettingsForm settingKey="why_us" initialRows={stored.value} />;
      break;
    }
    case "reparacion": {
      const steps = read(values, "repair_process", schemas.repair_process, []);
      invalid = steps.invalid;
      content = <ListSettingsForm settingKey="repair_process" initialRows={steps.value} />;
      break;
    }
    case "testimonios": {
      const testimonials = read(values, "testimonials", schemas.testimonials, []);
      invalid = testimonials.invalid;
      content = (
        <>
          <p className="text-muted-foreground mb-4 text-sm">
            Publica solo opiniones reales de tus clientes, con su permiso.
          </p>
          <ListSettingsForm settingKey="testimonials" initialRows={testimonials.value} />
        </>
      );
      break;
    }
    case "menu": {
      const promos = read(values, "nav_promos", schemas.nav_promos, {});
      invalid = promos.invalid;
      content = (
        <>
          <p className="text-muted-foreground mb-4 text-sm">
            La tarjeta que aparece en el menú de cada categoría principal. El “slug” es el de la
            categoría (por ejemplo, celulares).
          </p>
          <ListSettingsForm
            settingKey="nav_promos"
            initialRows={Object.entries(promos.value).map(([slug, promo]) => ({ slug, ...promo }))}
          />
        </>
      );
      break;
    }
  }

  return (
    <>
      <PageHeader
        title="Ajustes del sitio"
        description="Textos y datos que se muestran en la tienda. Los cambios se ven de inmediato."
      />

      <nav aria-label="Secciones de ajustes" className="mb-6 flex flex-wrap gap-1">
        {SECTIONS.map((item) => (
          <Link
            key={item.value}
            href={`/admin/ajustes?seccion=${item.value}`}
            aria-current={item.value === section.value ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              item.value === section.value
                ? "bg-ink text-surface"
                : "text-muted-foreground hover:bg-surface",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {invalid ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/5 mb-6 rounded-xl border p-4 text-sm"
        >
          El valor guardado de esta sección no tiene el formato esperado. Revisa los datos y guarda
          para corregirlo.
        </p>
      ) : null}

      <div className="max-w-3xl">{content}</div>
    </>
  );
}
