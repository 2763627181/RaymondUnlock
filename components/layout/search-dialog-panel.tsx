"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function SearchDialogPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onOpenChange(false);
    router.push(`/tienda?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar en la tienda</DialogTitle>
          <DialogDescription>Escribe el modelo, la marca o el tipo de producto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex gap-2" role="search">
          <label htmlFor="busqueda" className="sr-only">
            Buscar productos
          </label>
          <Input
            id="busqueda"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej. iPhone 15, AirPods…"
            maxLength={60}
            autoComplete="off"
          />
          <Button type="submit">Buscar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
