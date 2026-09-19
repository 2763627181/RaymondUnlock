"use client";

import { useId, useState } from "react";
import { ImagePlus } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/admin/compress-image";
import { cn } from "@/lib/utils";

/**
 * Zona para arrastrar imágenes o elegirlas del equipo. Es un <label> sobre un
 * input de archivo real: funciona con teclado y lectores de pantalla.
 */
export function ImageDropzone({
  onFiles,
  multiple = false,
  disabled = false,
  title,
  hint = "JPG, PNG, WebP o AVIF · se comprimen automáticamente",
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  title: string;
  hint?: string;
}) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) onFiles(Array.from(event.dataTransfer.files));
      }}
      className={cn(
        "border-border has-[:focus-visible]:ring-ring flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors has-[:focus-visible]:ring-2",
        dragging ? "border-brand-red bg-brand-red/5" : "hover:bg-surface-2/60",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <ImagePlus className="text-muted-foreground size-7" aria-hidden="true" />
      <span className="text-sm font-medium">{title}</span>
      <span className="text-muted-foreground text-xs">{hint}</span>
    </label>
  );
}
