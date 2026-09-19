-- Solicitudes de cuenta mayorista.
--
-- Estados (derivados, sin enum nuevo):
--   pendiente : role = 'wholesale' y wholesale_approved = false
--   aprobada  : role = 'wholesale' y wholesale_approved = true
--   rechazada : role = 'customer' y wholesale_reviewed_at is not null
-- La revisión la hace el servidor con service_role: la columna role no es
-- editable por authenticated (ver 20260918000002_security.sql).

alter table public.profiles
  add column estimated_volume text check (char_length(estimated_volume) <= 200),
  add column wholesale_reviewed_at timestamptz;

create index profiles_wholesale_reviewed_idx
  on public.profiles (wholesale_reviewed_at desc)
  where wholesale_reviewed_at is not null;

-- Igual que antes, nunca se confía en el metadata para el rol ni la aprobación.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, email, role, full_name, phone, business_name, rnc, estimated_volume,
    wholesale_approved
  )
  values (
    new.id,
    new.email,
    case
      when new.raw_user_meta_data ->> 'account_type' = 'wholesale'
        then 'wholesale'::public.user_role
      else 'customer'::public.user_role
    end,
    nullif(left(new.raw_user_meta_data ->> 'full_name', 120), ''),
    nullif(left(new.raw_user_meta_data ->> 'phone', 30), ''),
    nullif(left(new.raw_user_meta_data ->> 'business_name', 120), ''),
    nullif(left(new.raw_user_meta_data ->> 'rnc', 20), ''),
    nullif(left(new.raw_user_meta_data ->> 'estimated_volume', 200), ''),
    false
  );
  return new;
end;
$$;
