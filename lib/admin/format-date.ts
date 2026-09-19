const dateTime = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Santo_Domingo",
});

const dateOnly = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeZone: "America/Santo_Domingo",
});

export function formatDateTime(value: string | null): string {
  return value ? dateTime.format(new Date(value)) : "—";
}

export function formatDate(value: string | null): string {
  return value ? dateOnly.format(new Date(value)) : "—";
}
