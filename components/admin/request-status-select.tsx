"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setQuoteStatus } from "@/app/admin/cotizaciones/actions";
import { setRepairStatus } from "@/app/admin/reparaciones/actions";
import { NativeSelect } from "@/components/ui/native-select";
import {
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
  isRequestStatus,
  type RequestStatus,
} from "@/lib/admin/status";
import { runAction } from "@/lib/admin/run-action";

/** Cambia el estado de una cotización o reparación; se refleja al instante y vuelve atrás si falla. */
export function RequestStatusSelect({
  kind,
  id,
  status,
  className,
}: {
  kind: "quote" | "repair";
  id: string;
  status: RequestStatus;
  className?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    status,
    (_current, next: RequestStatus) => next,
  );

  function change(value: string) {
    if (!isRequestStatus(value)) return;
    startTransition(async () => {
      setOptimistic(value);
      const action = kind === "quote" ? setQuoteStatus(id, value) : setRepairStatus(id, value);
      const result = await runAction(action, "Estado actualizado");
      if (result.ok) router.refresh();
    });
  }

  return (
    <NativeSelect
      aria-label="Estado"
      value={optimistic}
      onChange={(event) => change(event.target.value)}
      className={className ?? "h-9 w-36"}
    >
      {REQUEST_STATUSES.map((value) => (
        <option key={value} value={value}>
          {REQUEST_STATUS_LABELS[value]}
        </option>
      ))}
    </NativeSelect>
  );
}
