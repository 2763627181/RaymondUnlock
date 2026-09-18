"use client";

import { Toast as ToastPrimitive } from "radix-ui";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/lib/toast-store";
import { cn } from "@/lib/utils";
import { springShort, REDUCED_MOTION_DURATION } from "@/lib/motion";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  success: "border-success/30 bg-card text-card-foreground",
  destructive: "border-destructive/30 bg-card text-destructive",
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const shouldReduceMotion = useReducedMotion();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <AnimatePresence>
        {toasts.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            asChild
            duration={5000}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
          >
            <m.li
              layout
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 16,
                scale: shouldReduceMotion ? 1 : 0.95,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
              transition={shouldReduceMotion ? { duration: REDUCED_MOTION_DURATION } : springShort}
              className={cn(
                "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 pr-8 shadow-lg",
                VARIANT_STYLES[item.variant],
              )}
            >
              <div className="grid gap-1">
                <ToastPrimitive.Title className="text-sm font-medium">
                  {item.title}
                </ToastPrimitive.Title>
                {item.description ? (
                  <ToastPrimitive.Description className="text-muted-foreground text-sm">
                    {item.description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              <ToastPrimitive.Close
                aria-label="Cerrar notificación"
                className="text-muted-foreground hover:text-foreground absolute top-2 right-2 rounded-md p-1"
              >
                <X className="size-4" />
              </ToastPrimitive.Close>
            </m.li>
          </ToastPrimitive.Root>
        ))}
      </AnimatePresence>
      <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-100 flex w-full max-w-sm list-none flex-col gap-2 p-4 outline-none sm:right-4 sm:bottom-4" />
    </ToastPrimitive.Provider>
  );
}
