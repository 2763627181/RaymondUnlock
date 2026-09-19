import { useEffect } from "react";
import {
  get,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormReturn,
} from "react-hook-form";
import { slugify } from "@/lib/admin/slug";

/**
 * Mientras se crea un registro, el slug sigue al nombre. En cuanto la persona
 * edita el slug a mano deja de seguirlo. Al editar uno existente nunca cambia
 * solo: cambiar un slug rompe los enlaces que ya se compartieron.
 */
export function useAutoSlug<T extends FieldValues>(
  form: UseFormReturn<T>,
  fields: { name: Path<T>; slug: Path<T> },
  enabled: boolean,
) {
  const name = form.watch(fields.name);
  const slugDirty = Boolean(get(form.formState.dirtyFields, fields.slug));

  useEffect(() => {
    if (!enabled || slugDirty) return;
    form.setValue(fields.slug, slugify(String(name ?? "")) as PathValue<T, Path<T>>);
  }, [name, enabled, slugDirty, form, fields.slug]);
}
