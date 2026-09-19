-- Esquema de Raymond Unlock: enums, tablas, índices y triggers.
-- La seguridad (RLS, vistas públicas, permisos) está en 20260918000002_security.sql.

-- ENUMS ---------------------------------------------------------------------

create type public.product_condition as enum ('nuevo', 'open_box', 'usado', 'reacondicionado');
create type public.user_role as enum ('customer', 'wholesale', 'admin');
create type public.quote_channel as enum ('whatsapp', 'email', 'both');
create type public.quote_status as enum ('nueva', 'contactada', 'cotizada', 'cerrada', 'cancelada');
create type public.price_tier as enum ('retail', 'wholesale');

-- FUNCIONES COMUNES ---------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- PERFILES (extiende auth.users) --------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,                       -- copia de auth.users.email para listar solicitudes en el admin
  role public.user_role not null default 'customer',
  full_name text,
  phone text,
  business_name text,               -- mayoristas
  rnc text,                         -- RNC dominicano, mayoristas
  wholesale_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- TAXONOMÍA -----------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  icon text,                        -- nombre de icono lucide (lista cerrada en lib/icons.tsx)
  image_url text,
  parent_id uuid references public.categories (id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  logo_url text,
  sort_order int not null default 0
);

-- PRODUCTOS -----------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  short_description text,
  description text,                 -- markdown mínimo: párrafos, listas "- " y **negrita**
  category_id uuid not null references public.categories (id),
  brand_id uuid references public.brands (id),
  condition public.product_condition not null default 'nuevo',
  specs jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  warranty_note text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- VARIANTES: capacidad, color y LOS DOS PRECIOS
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text unique,
  capacity text,
  color text,
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  price_retail numeric(12, 2) not null check (price_retail >= 0),
  price_wholesale numeric(12, 2) check (price_wholesale >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price >= 0),
  min_wholesale_qty int not null default 1 check (min_wholesale_qty >= 1),
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  url text not null,
  alt text,
  sort_order int not null default 0
);

-- SERVICIOS TÉCNICOS --------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  icon text,
  price_from numeric(12, 2) check (price_from >= 0),
  turnaround text,
  device_types text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- COTIZACIONES (el "checkout" del sitio) ------------------------------------

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- RU-2026-0001
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) <= 30),
  customer_email text check (char_length(customer_email) <= 150),
  business_name text check (char_length(business_name) <= 120),
  note text check (char_length(note) <= 500),
  tier public.price_tier not null default 'retail',
  channel public.quote_channel not null,
  status public.quote_status not null default 'nueva',
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  user_id uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,                -- snapshot, no join
  variant_label text,                        -- '128 GB · Titanio Natural'
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0)
);

-- SOLICITUDES DE REPARACIÓN -------------------------------------------------

create table public.repair_requests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                 -- RE-2026-0001
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) <= 30),
  customer_email text check (char_length(customer_email) <= 150),
  device text not null check (char_length(device) <= 80),
  service_id uuid references public.services (id),
  issue_description text not null check (char_length(issue_description) <= 1000),
  status public.quote_status not null default 'nueva',
  created_at timestamptz not null default now()
);

-- BANNERS Y CONFIGURACIÓN ---------------------------------------------------

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  cta_label text,
  cta_href text,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- Contenido público editable desde /admin/ajustes. NO guardar secretos aquí:
-- todas las filas son legibles por cualquier visitante.
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- CÓDIGOS CORRELATIVOS (RU-2026-0001, RE-2026-0001) -------------------------

create table public.code_counters (
  prefix text not null,
  year int not null,
  last_value int not null default 0,
  primary key (prefix, year)
);

-- Atómica: dos solicitudes simultáneas nunca reciben el mismo número.
-- Reinicia la numeración cada año (hora de Santo Domingo).
create function public.next_request_code(p_prefix text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year int := extract(year from (now() at time zone 'America/Santo_Domingo'))::int;
  v_next int;
begin
  if p_prefix !~ '^[A-Z]{2}$' then
    raise exception 'Prefijo de código inválido: %', p_prefix;
  end if;

  insert into public.code_counters as c (prefix, year, last_value)
  values (p_prefix, v_year, 1)
  on conflict (prefix, year) do update set last_value = c.last_value + 1
  returning c.last_value into v_next;

  return p_prefix || '-' || v_year || '-' || lpad(v_next::text, 4, '0');
end;
$$;

-- ÍNDICES -------------------------------------------------------------------

create index categories_parent_id_idx on public.categories (parent_id);
create index products_category_id_idx on public.products (category_id);
create index products_brand_id_idx on public.products (brand_id);
create index products_active_sort_idx on public.products (is_active, sort_order);
create index product_variants_product_id_idx on public.product_variants (product_id);
create index product_images_product_id_idx on public.product_images (product_id);
create index product_images_variant_id_idx on public.product_images (variant_id);
create index quotes_status_created_idx on public.quotes (status, created_at desc);
create index quotes_user_id_idx on public.quotes (user_id);
create index quote_items_quote_id_idx on public.quote_items (quote_id);
create index quote_items_variant_id_idx on public.quote_items (variant_id);
create index repair_requests_status_created_idx on public.repair_requests (status, created_at desc);
create index repair_requests_service_id_idx on public.repair_requests (service_id);
create index profiles_pending_wholesale_idx on public.profiles (created_at desc) where role = 'wholesale';
