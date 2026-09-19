# supabase/ — esquema, seguridad y datos

## Archivos

- `migrations/*_schema.sql` (tablas, enums, índices, triggers, `next_request_code`), `*_security.sql` (RLS, permisos, vistas públicas, bucket), `*_wholesale_accounts.sql`. Se aplican con `npx supabase db push --db-url "$SUPABASE_DB_URL"` (la conexión directa `db.<ref>.supabase.co` es solo IPv6: usa el _Session pooler_).
- `seed.sql`: catálogo de ejemplo, **datos ficticios**, idempotente (`on conflict do nothing`). Es la fuente de verdad del contenido inicial.
- `config.toml`: generado por `supabase init`; `supabase/.temp` está ignorado.

## Modelo de seguridad (no lo debilites)

- RLS activo en todas las tablas y **`revoke all` explícito** a `anon` y `authenticated` antes de otorgar lo mínimo. Supabase concede TODO por defecto a cada tabla, vista y función nueva; una vista simple con `security_invoker = false` es actualizable y correría escrituras como su dueño saltándose el RLS (así se encontró un agujero real en la primera versión). Cada objeto nuevo necesita su `revoke`/`grant`.
- `product_variants` cerrada a `anon` y `authenticated`. El público lee `v_catalog_products`, `v_catalog_variants`, `v_catalog_images` (sin `price_wholesale` ni `min_wholesale_qty`). Las vistas son `security definer` a propósito; el asesor de Supabase las marca y es lo esperado.
- Solicitudes (`quotes`, `quote_items`, `repair_requests`) sin `insert` público: las inserta el servidor con `service_role` tras validar con Zod y recalcular precios. Solo admin lee/edita/borra.
- `handle_new_user` nunca lee el rol del metadata; quien pide cuenta mayorista nace **sin aprobar**. `profiles` solo permite editar `full_name, phone, business_name, rnc`. Aprobar/rechazar cambia el rol con `service_role` desde el panel.
- Estados de mayorista (derivados, sin enum): pendiente = `wholesale` sin aprobar; aprobada = `wholesale` aprobada; rechazada = `customer` con `wholesale_reviewed_at`.
- Storage: bucket `products` público para leer, escribir solo admin (imágenes ≤ 5 MB). Hace falta una política `select` de admin para listar/actualizar/borrar. `DELETE` sin cuerpo no debe llevar `Content-Type: application/json` (la API responde 400).
- Funciones internas (`next_request_code`, `handle_new_user`, `set_updated_at`) no son ejecutables por `anon`/`authenticated`.

## Al cambiar el esquema

1. Nueva migración con marca de tiempo (no edites una ya aplicada en un entorno real; si aún no salió de tu máquina y la corriges, aplica la misma sentencia a mano y deja archivo y base iguales).
2. Regenerar `types/database.ts`: `npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" --schema public` (necesita Docker). Sin Docker: `@supabase/postgres-meta` con `PG_META_GENERATE_TYPES=typescript PG_META_DB_URL=… node …/dist/server/server.js`. Luego `pnpm exec prettier --write types/database.ts`.
3. **Sondear el resultado con peticiones reales**, no solo leer el SQL: como `anon` (llave pública), como usuario común y como admin. Debe fallar: leer `product_variants`/`price_wholesale`, escribir cualquier tabla o vista, ejecutar `rpc/next_request_code`, subirse el rol. Debe funcionar: lectura pública del catálogo, escrituras del admin. Los usuarios de prueba se crean con la API de administración y se borran al terminar.
4. Actualizar `seed.sql` si cambia el contenido inicial y el README si cambia el proceso.

## Credenciales

Van solo en `.env.local` (ignorado). Si una llave se compartió por chat o se filtró, rotarla en el panel de Supabase y en las variables de Vercel.
