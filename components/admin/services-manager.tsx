"use client";

import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteService, reorderServices } from "@/app/admin/servicios/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { ServiceForm, type ServiceRow } from "@/components/admin/service-form";
import { RowActions, SortableList } from "@/components/admin/sortable-list";
import { ActiveBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { DynamicIcon } from "@/lib/icons";

export function ServicesManager({ services }: { services: ServiceRow[] }) {
  const router = useRouter();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <FormDialog
          title="Nuevo servicio"
          trigger={
            <Button className="h-10">
              <Plus /> Nuevo servicio
            </Button>
          }
        >
          {(close) => <ServiceForm onDone={close} />}
        </FormDialog>
      </div>

      {services.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          Aún no hay servicios.
        </p>
      ) : (
        <SortableList
          items={services}
          label="Servicios"
          getLabel={(service) => service.name}
          onReorder={reorderServices}
          renderItem={(service) => (
            <div className="flex items-center gap-3">
              <span className="bg-surface-2 flex size-9 shrink-0 items-center justify-center rounded-full">
                <DynamicIcon name={service.icon} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{service.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {service.price_from !== null
                    ? `Desde ${formatPrice(service.price_from)}`
                    : "Sin precio"}
                  {service.turnaround ? ` · ${service.turnaround}` : ""}
                </p>
              </div>
              {service.is_active ? null : <ActiveBadge active={false} />}
              <RowActions>
                <FormDialog
                  title="Editar servicio"
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${service.name}`}>
                      <Pencil />
                    </Button>
                  }
                >
                  {(close) => <ServiceForm service={service} onDone={close} />}
                </FormDialog>
                <ConfirmButton
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${service.name}`}>
                      <Trash2 />
                    </Button>
                  }
                  title={`¿Eliminar “${service.name}”?`}
                  description="Si ya recibió solicitudes de reparación, desactívalo en su lugar para conservar el historial."
                  successTitle="Servicio eliminado"
                  onConfirm={() => deleteService(service.id)}
                  onDone={() => router.refresh()}
                />
              </RowActions>
            </div>
          )}
        />
      )}
    </>
  );
}
