"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import {
  addProductImages,
  deleteProductImage,
  reorderProductImages,
  updateProductImage,
} from "@/app/admin/productos/image-actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { RowActions, SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/admin/compress-image";
import { runAction } from "@/lib/admin/run-action";
import { uploadImage } from "@/lib/admin/upload-image";
import { toast } from "@/lib/toast-store";
import type { Tables } from "@/types/database";

export type ProductImageRow = Tables<"product_images">;
export interface VariantOption {
  id: string;
  label: string;
}

interface Pending {
  key: string;
  file: File;
  preview: string;
  alt: string;
  variantId: string;
}

const MIN_ALT = 3;

function VariantSelect({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: VariantOption[];
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <NativeSelect
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9"
    >
      <option value="">Todas las variantes</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </NativeSelect>
  );
}

function ExistingImage({ image, variants }: { image: ProductImageRow; variants: VariantOption[] }) {
  const router = useRouter();
  const [alt, setAlt] = useState(image.alt ?? "");

  async function save(next: { alt: string; variantId: string }) {
    const result = await runAction(
      updateProductImage({ id: image.id, alt: next.alt, variantId: next.variantId }),
    );
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <div className="bg-surface-2 relative size-16 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          fill
          unoptimized
          className="object-contain p-1"
        />
      </div>
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
        <Input
          aria-label="Texto alternativo de la imagen"
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          onBlur={() => {
            if (alt.trim() !== (image.alt ?? ""))
              void save({ alt, variantId: image.variant_id ?? "" });
          }}
          className="h-9"
        />
        <VariantSelect
          label="Variante de la imagen"
          value={image.variant_id ?? ""}
          options={variants}
          onChange={(variantId) => void save({ alt, variantId })}
        />
      </div>
      <RowActions>
        <ConfirmButton
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="Eliminar imagen">
              <Trash2 />
            </Button>
          }
          title="¿Eliminar esta imagen?"
          description="Se quita del producto y, si nadie más la usa, se borra del almacenamiento."
          successTitle="Imagen eliminada"
          onConfirm={() => deleteProductImage(image.id)}
          onDone={() => router.refresh()}
        />
      </RowActions>
    </div>
  );
}

export function ProductImagesPanel({
  productId,
  images,
  variants,
}: {
  productId: string;
  images: ProductImageRow[];
  variants: VariantOption[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(false);

  function addFiles(files: File[]) {
    const accepted = files.filter((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (accepted.length < files.length) {
      toast({
        title: "Algunos archivos se omitieron",
        description: "Solo se aceptan imágenes JPG, PNG, WebP o AVIF.",
        variant: "destructive",
      });
    }
    setPending((current) => [
      ...current,
      ...accepted.map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        alt: "",
        variantId: "",
      })),
    ]);
  }

  function update(key: string, changes: Partial<Pending>) {
    setPending((current) =>
      current.map((item) => (item.key === key ? { ...item, ...changes } : item)),
    );
  }

  function discard(key: string) {
    setPending((current) => {
      const item = current.find((entry) => entry.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((entry) => entry.key !== key);
    });
  }

  const ready = pending.length > 0 && pending.every((item) => item.alt.trim().length >= MIN_ALT);

  async function upload() {
    setUploading(true);
    const uploaded: { url: string; alt: string; variantId: string }[] = [];
    for (const item of pending) {
      const result = await uploadImage(item.file, productId);
      if (!result.ok) {
        toast({
          title: `No se pudo subir ${item.file.name}`,
          description: result.message,
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      uploaded.push({ url: result.url, alt: item.alt.trim(), variantId: item.variantId });
    }
    const result = await runAction(
      addProductImages({ productId, images: uploaded }),
      uploaded.length === 1 ? "Imagen agregada" : "Imágenes agregadas",
    );
    setUploading(false);
    if (result.ok) {
      for (const item of pending) URL.revokeObjectURL(item.preview);
      setPending([]);
      router.refresh();
    }
  }

  return (
    <section aria-labelledby="imagenes-titulo" className="space-y-4">
      <div>
        <h2 id="imagenes-titulo" className="text-lg font-semibold">
          Imágenes
        </h2>
        <p className="text-muted-foreground text-[13px]">
          La primera es la principal. Todas llevan texto alternativo (obligatorio) y pueden
          asignarse a una variante.
        </p>
      </div>

      {images.length > 0 ? (
        <SortableList
          items={images}
          label="Imágenes del producto"
          getLabel={(image) => image.alt ?? "imagen"}
          onReorder={(ids) => reorderProductImages({ productId, ids })}
          renderItem={(image) => <ExistingImage image={image} variants={variants} />}
        />
      ) : (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
          Sin imágenes: la tienda muestra una ilustración de respaldo.
        </p>
      )}

      <ImageDropzone
        multiple
        onFiles={addFiles}
        disabled={uploading}
        title="Arrastra imágenes aquí o haz clic para elegirlas"
      />

      {pending.length > 0 ? (
        <div className="space-y-3">
          <ul className="space-y-3">
            {pending.map((item) => {
              const invalid = item.alt.trim().length < MIN_ALT;
              return (
                <li
                  key={item.key}
                  className="border-border bg-surface flex items-start gap-3 rounded-xl border p-3"
                >
                  <div className="bg-surface-2 relative size-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.preview}
                      alt=""
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                    <div>
                      <Input
                        aria-label={`Texto alternativo de ${item.file.name}`}
                        aria-invalid={invalid}
                        placeholder="Describe la imagen (obligatorio)"
                        value={item.alt}
                        onChange={(event) => update(item.key, { alt: event.target.value })}
                        className="h-9"
                      />
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {item.file.name}
                      </p>
                    </div>
                    <VariantSelect
                      label={`Variante de ${item.file.name}`}
                      value={item.variantId}
                      options={variants}
                      onChange={(variantId) => update(item.key, { variantId })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Descartar ${item.file.name}`}
                    onClick={() => discard(item.key)}
                    disabled={uploading}
                  >
                    <X />
                  </Button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-end gap-3">
            {ready ? null : (
              <p className="text-muted-foreground text-sm">
                Escribe el texto alternativo de cada imagen.
              </p>
            )}
            <Button className="h-10" disabled={!ready || uploading} onClick={upload}>
              {uploading
                ? "Subiendo…"
                : `Subir ${pending.length} ${pending.length === 1 ? "imagen" : "imágenes"}`}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
