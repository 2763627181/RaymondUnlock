export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-destructive mt-1.5 text-[13px]">
      {message}
    </p>
  );
}
