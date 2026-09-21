import type { ReactNode } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { SectionTabs, type SectionTab } from "@/components/admin/section-tabs";

const TABS: SectionTab[] = [
  { href: "/admin/proveedores", label: "Productos", exact: true },
  { href: "/admin/proveedores/contactos", label: "Contactos de venta" },
  { href: "/admin/proveedores/pedidos", label: "Pedidos" },
];

/** Título de la sección del listado mayorista, con sus tres pestañas. */
export function WholesaleAdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} description={description} actions={actions} />
      <SectionTabs tabs={TABS} label="Listado mayorista" />
    </>
  );
}
