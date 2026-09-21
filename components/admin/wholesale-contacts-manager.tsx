"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteWholesaleContact, reorderWholesaleContacts } from "@/app/admin/proveedores/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { RowActions, SortableList } from "@/components/admin/sortable-list";
import { ActiveBadge } from "@/components/admin/status-badge";
import {
  WholesaleContactForm,
  type WholesaleContactRow,
} from "@/components/admin/wholesale-contact-form";
import { Button } from "@/components/ui/button";
import { formatWhatsappNumber } from "@/lib/wholesale/format";

export function WholesaleContactsManager({ contacts }: { contacts: WholesaleContactRow[] }) {
  const router = useRouter();

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          A quién le llega el pedido. Arrastra para cambiar el orden en que aparecen.
        </p>
        <FormDialog
          title="Nuevo contacto"
          trigger={
            <Button className="h-10 shrink-0">
              <Plus /> Nuevo contacto
            </Button>
          }
        >
          {(close) => <WholesaleContactForm onDone={close} />}
        </FormDialog>
      </div>

      {contacts.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          Sin contactos: los pedidos se envían al WhatsApp del negocio (el de Ajustes). Agrega
          vendedores para que el cliente elija a quién escribirle.
        </p>
      ) : (
        <SortableList
          items={contacts}
          label="Contactos de venta"
          getLabel={(contact) => contact.label}
          onReorder={reorderWholesaleContacts}
          renderItem={(contact) => (
            <div className="flex items-center gap-3">
              <span className="bg-success-700 grid size-10 shrink-0 place-items-center rounded-full text-white">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {contact.label}
                  {contact.person_name ? (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      — {contact.person_name}
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatWhatsappNumber(contact.whatsapp)}
                </p>
              </div>
              {contact.is_active ? null : <ActiveBadge active={false} />}
              <RowActions>
                <FormDialog
                  title="Editar contacto"
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${contact.label}`}>
                      <Pencil />
                    </Button>
                  }
                >
                  {(close) => <WholesaleContactForm contact={contact} onDone={close} />}
                </FormDialog>
                <ConfirmButton
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${contact.label}`}>
                      <Trash2 />
                    </Button>
                  }
                  title={`¿Eliminar “${contact.label}”?`}
                  description="Deja de aparecer al enviar un pedido. Los pedidos anteriores conservan a quién se enviaron."
                  successTitle="Contacto eliminado"
                  onConfirm={() => deleteWholesaleContact(contact.id)}
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
