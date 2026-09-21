-- Fecha de cierre de las cotizaciones.
--
-- Una cotización en estado "cerrada" es una venta. Para el informe de ventas del
-- mes hace falta saber CUÁNDO se cerró (no cuándo se pidió: una cotización de
-- agosto cerrada en septiembre es una venta de septiembre), así que un trigger
-- guarda la fecha en el momento en que el estado pasa a "cerrada" y la borra si
-- se reabre o se cancela.

alter table public.quotes add column closed_at timestamptz;

create function public.set_quote_closed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'cerrada' then
    if tg_op = 'INSERT' or old.status is distinct from 'cerrada' then
      new.closed_at := now();
    end if;
  else
    new.closed_at := null;
  end if;
  return new;
end;
$$;

revoke execute on function public.set_quote_closed_at() from public, anon, authenticated;

create trigger quotes_set_closed_at
  before insert or update of status on public.quotes
  for each row execute function public.set_quote_closed_at();

-- Lo que ya estuviera cerrado no guardó la fecha exacta: se usa la de la cotización.
-- (No dispara el trigger: no toca la columna status.)
update public.quotes set closed_at = created_at where status = 'cerrada' and closed_at is null;

create index quotes_closed_at_idx on public.quotes (closed_at) where closed_at is not null;
