import { Badge } from "@/components/ui/badge";
import {
  REQUEST_STATUS_CLASSES,
  REQUEST_STATUS_LABELS,
  type RequestStatus,
} from "@/lib/admin/status";
import { cn } from "@/lib/utils";

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge className={cn("border-transparent", REQUEST_STATUS_CLASSES[status])}>
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-success-700/15 text-success-700 border-transparent">Activo</Badge>
  ) : (
    <Badge className="bg-muted text-muted-foreground border-transparent">Inactivo</Badge>
  );
}
