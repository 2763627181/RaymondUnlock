"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteBanner, reorderBanners } from "@/app/admin/banners/actions";
import { BannerForm, type BannerRow } from "@/components/admin/banner-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormDialog } from "@/components/admin/form-dialog";
import { RowActions, SortableList } from "@/components/admin/sortable-list";
import { ActiveBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

export function BannersManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <FormDialog
          title="Nuevo banner"
          trigger={
            <Button className="h-10">
              <Plus /> Nuevo banner
            </Button>
          }
        >
          {(close) => <BannerForm onDone={close} />}
        </FormDialog>
      </div>

      {banners.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          Aún no hay banners: la portada mostrará la imagen por defecto.
        </p>
      ) : (
        <SortableList
          items={banners}
          label="Banners"
          getLabel={(banner) => banner.title}
          onReorder={reorderBanners}
          renderItem={(banner) => (
            <div className="flex items-center gap-3">
              <div className="bg-ink relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                <Image src={banner.image_url} alt="" fill unoptimized className="object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{banner.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {banner.cta_href ?? "Sin enlace"}
                </p>
              </div>
              {banner.is_active ? null : <ActiveBadge active={false} />}
              <RowActions>
                <FormDialog
                  title="Editar banner"
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${banner.title}`}>
                      <Pencil />
                    </Button>
                  }
                >
                  {(close) => <BannerForm banner={banner} onDone={close} />}
                </FormDialog>
                <ConfirmButton
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${banner.title}`}>
                      <Trash2 />
                    </Button>
                  }
                  title={`¿Eliminar “${banner.title}”?`}
                  description="Se borra el banner y su imagen. Esta acción no se puede deshacer."
                  successTitle="Banner eliminado"
                  onConfirm={() => deleteBanner(banner.id)}
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
