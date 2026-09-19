"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/actions/result";
import { runAction } from "@/lib/admin/run-action";

/** Botón que pide confirmación antes de ejecutar una acción destructiva (borrar, rechazar…). */
export function ConfirmButton({
  trigger,
  title,
  description,
  confirmLabel = "Eliminar",
  successTitle,
  destructive = true,
  onConfirm,
  onDone,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  successTitle?: string;
  destructive?: boolean;
  onConfirm: () => Promise<ActionResult<unknown>>;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    const result = await runAction(onConfirm(), successTitle);
    setPending(false);
    if (result.ok) {
      setOpen(false);
      onDone?.();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={confirm}
            disabled={pending}
          >
            {pending ? "Procesando…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
