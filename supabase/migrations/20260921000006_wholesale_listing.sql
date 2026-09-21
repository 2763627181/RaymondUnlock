-- Listado al por mayor (/proveedores): el negocio publica su lista de precios al
-- por mayor para que otros negocios armen un pedido y lo manden por WhatsApp.
--
--  * wholesale_products: la lista. Tipo, categoría y condición son texto libre:
--    los filtros de la página salen de lo que haya escrito, sin tablas aparte.
--  * wholesale_contacts: a quién se le manda el pedido ("Ventas 1 — Ashley").
--  * wholesale_orders / wholesale_order_items: historial de pedidos enviados.
--
-- Estos precios SON públicos (es la lista que el negocio decidió compartir). Los
-- pedidos no: solo los ve el admin y solo el servidor los inserta.

create table public.wholesale_products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  product_type text not null default 'Otros' check (char_length(product_type) between 1 and 40),
  category text not null check (char_length(category) between 1 and 80),
  condition text not null default 'Nuevo' check (char_length(condition) between 1 and 40),
  price numeric(12, 2) not null check (price >= 0),
  image_url text check (char_length(image_url) <= 500),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wholesale_products_active_order_idx
  on public.wholesale_products (sort_order, name) where is_active;

create trigger wholesale_products_set_updated_at
  before update on public.wholesale_products
  for each row execute function public.set_updated_at();

create table public.wholesale_contacts (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 40),
  person_name text check (char_length(person_name) <= 60),
  -- Solo dígitos con código de país (18097123062), como en site_settings.
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,15}$'),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.wholesale_orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- PM-2026-0001
  -- A quién se le mandó, tal como estaba entonces (el contacto puede cambiar o borrarse).
  contact_label text,
  contact_whatsapp text,
  status public.quote_status not null default 'nueva',
  total numeric(12, 2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create index wholesale_orders_created_idx on public.wholesale_orders (created_at desc);

create table public.wholesale_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.wholesale_orders (id) on delete cascade,
  product_id uuid references public.wholesale_products (id) on delete set null,
  product_name text not null,                -- snapshot, no join
  category text,
  condition text,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0)
);

create index wholesale_order_items_order_idx on public.wholesale_order_items (order_id);

-- SEGURIDAD -------------------------------------------------------------------

alter table public.wholesale_products enable row level security;
alter table public.wholesale_contacts enable row level security;
alter table public.wholesale_orders enable row level security;
alter table public.wholesale_order_items enable row level security;

-- Supabase concede todo por defecto a cada tabla nueva: se parte de cero.
revoke all on public.wholesale_products, public.wholesale_contacts,
  public.wholesale_orders, public.wholesale_order_items
from anon, authenticated;

-- Lista y contactos: lectura abierta (solo lo activo), escritura solo admin.
grant select on public.wholesale_products, public.wholesale_contacts to anon, authenticated;
grant insert, update, delete on public.wholesale_products, public.wholesale_contacts
  to authenticated;

create policy wholesale_products_read on public.wholesale_products
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy wholesale_contacts_read on public.wholesale_contacts
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

do $$
declare
  t text;
begin
  foreach t in array array['wholesale_products', 'wholesale_contacts']
  loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select public.is_admin()))',
      t || '_admin_insert', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      t || '_admin_update', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))',
      t || '_admin_delete', t);
  end loop;
end;
$$;

-- Pedidos: nadie inserta desde la API; el servidor guarda tras validar y volver a
-- calcular precios (service_role). Solo el admin los lee, edita o borra.
grant select, update, delete on public.wholesale_orders, public.wholesale_order_items
  to authenticated;

create policy wholesale_orders_admin_select on public.wholesale_orders
  for select to authenticated using ((select public.is_admin()));
create policy wholesale_orders_admin_update on public.wholesale_orders
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy wholesale_orders_admin_delete on public.wholesale_orders
  for delete to authenticated using ((select public.is_admin()));

create policy wholesale_order_items_admin_select on public.wholesale_order_items
  for select to authenticated using ((select public.is_admin()));
create policy wholesale_order_items_admin_update on public.wholesale_order_items
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy wholesale_order_items_admin_delete on public.wholesale_order_items
  for delete to authenticated using ((select public.is_admin()));
