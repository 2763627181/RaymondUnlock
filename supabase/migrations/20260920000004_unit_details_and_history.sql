-- Datos de cada equipo, códigos automáticos e historial de cambios del catálogo.
--
--  1. Cada variante guarda su batería y su tipo de liberación: "factory" (de
--     fábrica) o "artista" (liberado por un técnico). Son campos públicos: salen
--     en la ficha del producto y en el mensaje de WhatsApp.
--  2. Cada variante lleva fecha de creación y de última modificación.
--  3. Toda variante tiene un código (sku): si no se escribe uno, se asigna
--     RU-00001, RU-00002… Es el código que va en el mensaje de WhatsApp y con el
--     que el admin busca el producto.
--  4. product_history guarda qué cambió, cuándo y con qué valores antes/después.
--     Solo un admin puede leerlo y solo los triggers lo escriben.

-- 1 y 2. Campos de la variante ------------------------------------------------

create type public.unlock_type as enum ('factory', 'artista');

alter table public.product_variants
  add column battery_health smallint check (battery_health between 0 and 100),
  add column unlock_type public.unlock_type,
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- 3. Código automático --------------------------------------------------------

create sequence public.variant_code_seq;
revoke all on sequence public.variant_code_seq from anon, authenticated;

create function public.assign_variant_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.sku is null or btrim(new.sku) = '' then
    loop
      new.sku := 'RU-' || lpad(nextval('public.variant_code_seq')::text, 5, '0');
      exit when not exists (select 1 from public.product_variants where sku = new.sku);
    end loop;
  else
    new.sku := btrim(new.sku);
  end if;
  return new;
end;
$$;

revoke execute on function public.assign_variant_code() from public, anon, authenticated;

create trigger product_variants_assign_code
  before insert or update of sku on public.product_variants
  for each row execute function public.assign_variant_code();

-- 4. Historial de cambios -----------------------------------------------------

create table public.product_history (
  id bigint generated always as identity primary key,
  -- Sin llave foránea a propósito: el historial de un producto borrado se conserva.
  product_id uuid not null,
  entity text not null check (entity in ('product', 'variant', 'image')),
  entity_id uuid not null,
  action text not null check (action in ('create', 'update', 'delete')),
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz not null default now()
);

create index product_history_product_idx
  on public.product_history (product_id, changed_at desc);

alter table public.product_history enable row level security;

revoke all on public.product_history from anon, authenticated;
grant select on public.product_history to authenticated;

create policy product_history_admin_select on public.product_history
  for select to authenticated using ((select public.is_admin()));

create function public.record_product_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity text;
  v_row jsonb;
  v_old jsonb;
  v_new jsonb;
begin
  v_entity := case tg_table_name
    when 'products' then 'product'
    when 'product_variants' then 'variant'
    else 'image'
  end;
  v_old := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;

  -- Un guardado sin cambios reales (o que solo mueve el orden o la marca de
  -- tiempo) no deja rastro.
  if tg_op = 'UPDATE'
     and (v_old - 'updated_at' - 'sort_order') = (v_new - 'updated_at' - 'sort_order') then
    return null;
  end if;

  v_row := coalesce(v_new, v_old);
  insert into public.product_history (product_id, entity, entity_id, action, old_data, new_data)
  values (
    case v_entity when 'product' then (v_row ->> 'id')::uuid else (v_row ->> 'product_id')::uuid end,
    v_entity,
    (v_row ->> 'id')::uuid,
    case tg_op when 'INSERT' then 'create' when 'UPDATE' then 'update' else 'delete' end,
    v_old,
    v_new
  );
  return null;
end;
$$;

revoke execute on function public.record_product_history() from public, anon, authenticated;

create trigger products_record_history
  after insert or update or delete on public.products
  for each row execute function public.record_product_history();

create trigger product_variants_record_history
  after insert or update or delete on public.product_variants
  for each row execute function public.record_product_history();

-- Las imágenes solo dejan rastro al subirse o quitarse (reordenarlas no cuenta).
create trigger product_images_record_history
  after insert or delete on public.product_images
  for each row execute function public.record_product_history();

-- Vista pública: mismas columnas de siempre + batería y liberación. Sigue sin
-- precio mayorista ni cantidad mínima.

create or replace view public.v_catalog_variants
with (security_invoker = false)
as
  select
    v.id, v.product_id, v.sku, v.capacity, v.color, v.color_hex,
    v.price_retail, v.compare_at_price, v.stock, v.is_active, v.sort_order,
    v.battery_health, v.unlock_type
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where v.is_active and p.is_active;

revoke all on public.v_catalog_variants from anon, authenticated;
grant select on public.v_catalog_variants to anon, authenticated;
