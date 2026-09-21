import { ActiveBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/admin/format-date";
import { CONDITION_LABELS, UNLOCK_LABELS, formatBattery } from "@/lib/catalog/text";
import { formatPrice } from "@/lib/format";
import type { Tables } from "@/types/database";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words">{children}</dd>
    </div>
  );
}

/** Última vez que algo del producto cambió: él mismo o cualquiera de sus variantes. */
function lastModified(product: Tables<"products">, variants: Tables<"product_variants">[]): string {
  return [product.updated_at, ...variants.map((variant) => variant.updated_at)].reduce(
    (latest, value) => (new Date(value) > new Date(latest) ? value : latest),
  );
}

/** Ficha completa para el admin: todo lo que se sabe del producto y de cada equipo. */
export function ProductInfoPanel({
  product,
  variants,
  categoryName,
  brandName,
}: {
  product: Tables<"products">;
  variants: Tables<"product_variants">[];
  categoryName: string | null;
  brandName: string | null;
}) {
  return (
    <section
      aria-labelledby="ficha-titulo"
      className="border-border bg-surface mb-8 space-y-5 rounded-xl border p-5"
    >
      <h2 id="ficha-titulo" className="text-lg font-semibold">
        Ficha del producto
      </h2>

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="ID del producto">
          <span className="font-mono text-xs">{product.id}</span>
        </Fact>
        <Fact label="Categoría">{categoryName ?? "—"}</Fact>
        <Fact label="Marca">{brandName ?? "—"}</Fact>
        <Fact label="Estado">{CONDITION_LABELS[product.condition]}</Fact>
        <Fact label="Publicado">
          <ActiveBadge active={product.is_active} />
        </Fact>
        <Fact label="Destacado">{product.is_featured ? "Sí" : "No"}</Fact>
        <Fact label="Creado">{formatDateTime(product.created_at)}</Fact>
        <Fact label="Última modificación">{formatDateTime(lastModified(product, variants))}</Fact>
      </dl>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Batería</TableHead>
              <TableHead>Liberación</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Precio unidad</TableHead>
              <TableHead className="text-right">Precio tachado</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead>Modificada</TableHead>
              <TableHead>ID de la variante</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-mono text-xs font-semibold whitespace-nowrap">
                  {variant.sku ?? "—"}
                </TableCell>
                <TableCell>{variant.capacity ?? "—"}</TableCell>
                <TableCell>{variant.color ?? "—"}</TableCell>
                <TableCell>
                  {variant.battery_health === null ? "—" : formatBattery(variant.battery_health)}
                </TableCell>
                <TableCell>
                  {variant.unlock_type ? UNLOCK_LABELS[variant.unlock_type] : "—"}
                </TableCell>
                <TableCell className="text-right">{variant.stock}</TableCell>
                <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                  {formatPrice(variant.price_retail)}
                </TableCell>
                <TableCell className="tabular-nums-price text-right whitespace-nowrap">
                  {variant.compare_at_price === null ? "—" : formatPrice(variant.compare_at_price)}
                </TableCell>
                <TableCell>{variant.is_active ? "Sí" : "No"}</TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(variant.created_at)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(variant.updated_at)}
                </TableCell>
                <TableCell className="font-mono text-[11px]">{variant.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
