-- Seguridad de Raymond Unlock.
--
-- Principios:
--  1. Supabase concede permisos por defecto a anon/authenticated sobre tablas
--     nuevas; aquí se revoca TODO y se otorga solo lo necesario.
--  2. El precio mayorista (product_variants.price_wholesale) no es legible por
--     anon ni authenticated: el público lee vistas sin esa columna y el precio
--     mayorista solo lo sirve el servidor (service_role) a mayoristas aprobados.
--  3. Las escrituras de catálogo exigen is_admin(). Las solicitudes públicas
--     (cotizaciones, reparaciones) se insertan solo desde el servidor, que
--     valida con Zod y recalcula los precios.

-- HELPERS -------------------------------------------------------------------

-- Devuelve true si la sesión actual es de un administrador.
-- security definer: lee profiles sin depender de las políticas de profiles.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Al registrarse un usuario se crea su perfil. Nunca se confía en el metadata
-- para el rol: solo puede pedir ser mayorista, y siempre queda SIN aprobar
-- hasta que un admin lo apruebe.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, email, role, full_name, phone, business_name, rnc, wholesale_approved
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
    false
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Función de trigger: no debe poder invocarse como RPC desde la API.
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Solo el servidor genera códigos de cotización/reparación.
revoke execute on function public.next_request_code(text) from public, anon, authenticated;
grant execute on function public.next_request_code(text) to service_role;

-- RLS ACTIVADO EN TODAS LAS TABLAS -------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.services enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.repair_requests enable row level security;
alter table public.banners enable row level security;
alter table public.site_settings enable row level security;
alter table public.code_counters enable row level security;

-- PERMISOS: partir de cero -------------------------------------------------

revoke all on
  public.profiles, public.categories, public.brands, public.products,
  public.product_variants, public.product_images, public.services,
  public.quotes, public.quote_items, public.repair_requests,
  public.banners, public.site_settings, public.code_counters
from anon, authenticated;

-- PERFILES: cada quien lee y edita su fila; admin lee todas ----------------
-- Sin insert (lo hace el trigger) ni delete (cae en cascada desde auth.users).
-- La edición se limita por columna: nadie puede cambiarse role ni
-- wholesale_approved. Aprobar mayoristas se hace en el servidor (service_role).

grant select on public.profiles to authenticated;
grant update (full_name, phone, business_name, rnc) on public.profiles to authenticated;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- CONTENIDO PÚBLICO: lectura abierta, escritura solo admin -------------------

grant select on public.categories, public.brands, public.services, public.banners,
  public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.brands, public.services,
  public.banners, public.site_settings to authenticated;

create policy categories_read on public.categories
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy brands_read on public.brands
  for select to anon, authenticated using (true);

create policy services_read on public.services
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy banners_read on public.banners
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy site_settings_read on public.site_settings
  for select to anon, authenticated using (true);

-- Escrituras de admin por acción (no "for all") para no duplicar políticas de select.
do $$
declare
  t text;
begin
  foreach t in array array['categories', 'brands', 'services', 'banners', 'site_settings']
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

-- CATÁLOGO: tablas base solo para admin; el público lee vistas -------------
-- products y product_images: sin acceso para anon. El público usa las vistas.
-- product_variants: sin acceso para anon NI authenticated (contiene el precio
-- mayorista). El admin la escribe desde el servidor con service_role.

grant select, insert, update, delete on public.products, public.product_images to authenticated;

create policy products_admin_all on public.products
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy product_images_admin_all on public.product_images
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- SOLICITUDES: solo admin lee/edita/borra; el servidor inserta ---------------

grant select, update, delete on public.quotes, public.quote_items,
  public.repair_requests to authenticated;

create policy quotes_admin_select on public.quotes
  for select to authenticated using ((select public.is_admin()));
create policy quotes_admin_update on public.quotes
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy quotes_admin_delete on public.quotes
  for delete to authenticated using ((select public.is_admin()));

create policy quote_items_admin_select on public.quote_items
  for select to authenticated using ((select public.is_admin()));
create policy quote_items_admin_update on public.quote_items
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy quote_items_admin_delete on public.quote_items
  for delete to authenticated using ((select public.is_admin()));

create policy repair_requests_admin_select on public.repair_requests
  for select to authenticated using ((select public.is_admin()));
create policy repair_requests_admin_update on public.repair_requests
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy repair_requests_admin_delete on public.repair_requests
  for delete to authenticated using ((select public.is_admin()));

-- VISTAS PÚBLICAS DEL CATÁLOGO ------------------------------------------------
-- Se ejecutan con los permisos de su dueño (security_invoker = false) a
-- propósito: es lo que permite exponer un subconjunto de columnas y filas de
-- tablas a las que anon no tiene acceso. El asesor de seguridad de Supabase
-- las marcará como "security definer view": es esperado en este diseño.

create view public.v_catalog_products
with (security_invoker = false)
as
  select
    id, slug, name, short_description, description, category_id, brand_id,
    condition, specs, is_featured, warranty_note, sort_order, created_at, updated_at
  from public.products
  where is_active;

-- Solo campos retail: sin price_wholesale ni min_wholesale_qty.
create view public.v_catalog_variants
with (security_invoker = false)
as
  select
    v.id, v.product_id, v.sku, v.capacity, v.color, v.color_hex,
    v.price_retail, v.compare_at_price, v.stock, v.is_active, v.sort_order
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where v.is_active and p.is_active;

create view public.v_catalog_images
with (security_invoker = false)
as
  select i.id, i.product_id, i.variant_id, i.url, i.alt, i.sort_order
  from public.product_images i
  join public.products p on p.id = i.product_id
  where p.is_active;

-- Supabase concede TODOS los permisos por defecto sobre objetos nuevos. Una
-- vista simple con security_invoker = false es actualizable y correría las
-- escrituras como su dueño (saltándose el RLS), así que se deja solo select.
revoke all on public.v_catalog_products, public.v_catalog_variants,
  public.v_catalog_images from anon, authenticated;
grant select on public.v_catalog_products, public.v_catalog_variants,
  public.v_catalog_images to anon, authenticated;

-- STORAGE: bucket público de imágenes; solo admin sube/edita/borra -----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products', 'products', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

-- Un bucket público sirve sus archivos por URL sin política de lectura; esta
-- es para el admin: update/delete con WHERE exigen poder "ver" la fila, y el
-- panel lista los archivos. anon no puede listar el bucket.
create policy products_bucket_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'products' and (select public.is_admin()));

create policy products_bucket_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'products' and (select public.is_admin()));

create policy products_bucket_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'products' and (select public.is_admin()))
  with check (bucket_id = 'products' and (select public.is_admin()));

create policy products_bucket_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'products' and (select public.is_admin()));
