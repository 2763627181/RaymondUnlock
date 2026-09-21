"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { TextField } from "@/components/forms/text-field";
import { uploadImage } from "@/lib/admin/upload-image";
import { toast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

/**
 * Sube una imagen al bucket (con la sesión del admin) y deja su URL en el campo.
 * También se puede pegar una ruta del sitio a mano.
 */
export function ImageUrlField({
  id = "imageUrl",
  value,
  onChange,
  folder,
  error,
  previewClassName = "aspect-[16/7] bg-ink",
  optional = false,
}: {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  /** Carpeta del bucket donde se guarda ("banners", "wholesale"…). */
  folder: string;
  error?: string | undefined;
  previewClassName?: string;
  optional?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadImage(file, folder);
    setUploading(false);
    if (result.ok) onChange(result.url);
    else toast({ title: "No se pudo subir", description: result.message, variant: "destructive" });
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className={cn("relative overflow-hidden rounded-lg", previewClassName)}>
          <Image src={value} alt="Vista previa" fill unoptimized className="object-contain" />
        </div>
      ) : null}
      <ImageDropzone
        onFiles={handleFiles}
        disabled={uploading}
        title={uploading ? "Subiendo…" : value ? "Cambiar imagen" : "Subir imagen"}
      />
      <TextField
        id={id}
        label="URL de la imagen"
        hint={optional ? " (opcional; se llena al subir)" : " (se llena al subir)"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
      />
    </div>
  );
}
