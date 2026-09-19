"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { saveSetting } from "@/app/admin/ajustes/actions";
import { SelectField } from "@/components/forms/select-field";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Button } from "@/components/ui/button";
import { runAction } from "@/lib/admin/run-action";
import {
  LIST_SECTIONS,
  type ListSectionConfig,
  type ListSectionKey,
  type Row,
} from "@/components/admin/list-settings-config";
import { ICON_NAMES } from "@/lib/icons";

/**
 * Editor de una lista de filas (garantías, testimonios, horarios…). Cada fila
 * tiene los mismos campos; se valida con el esquema de la tienda antes de enviar.
 * La configuración de cada lista está en list-settings-config.ts.
 */
export function ListSettingsForm({
  settingKey,
  initialRows,
}: {
  settingKey: ListSectionKey;
  initialRows: Row[];
}) {
  const config: ListSectionConfig = LIST_SECTIONS[settingKey];
  const { rowSchema, fields, blankRow, maxRows, addLabel, rowLabel, toValue } = config;
  const router = useRouter();
  const schema = z.object({ rows: z.array(rowSchema).max(maxRows) });
  const { register, control, handleSubmit, reset, formState } = useForm<
    { rows: Row[] },
    unknown,
    { rows: Row[] }
  >({
    resolver: zodResolver(schema),
    defaultValues: { rows: initialRows },
    mode: "onTouched",
  });
  const {
    fields: rows,
    append,
    remove,
  } = useFieldArray({ control, name: "rows", keyName: "fieldKey" });
  const { errors, isSubmitting, isDirty } = formState;

  async function onSubmit(values: { rows: Row[] }) {
    const value = toValue ? toValue(values.rows) : values.rows;
    const result = await runAction(saveSetting(settingKey, value), "Cambios guardados");
    if (result.ok) {
      reset({ rows: values.rows });
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <ul className="space-y-4">
        {rows.map((row, index) => (
          <li
            key={row.fieldKey}
            className="border-border bg-surface space-y-3 rounded-xl border p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {rowLabel} {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Quitar ${rowLabel.toLowerCase()} ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => {
                const id = `${settingKey}-${index}-${field.name}`;
                const error = errors.rows?.[index]?.[field.name]?.message;
                const path = `rows.${index}.${field.name}` as const;
                if (field.kind === "icon") {
                  return (
                    <SelectField
                      key={field.name}
                      id={id}
                      label={field.label}
                      error={error}
                      {...register(path)}
                    >
                      {ICON_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </SelectField>
                  );
                }
                if (field.kind === "textarea") {
                  return (
                    <div key={field.name} className="sm:col-span-2">
                      <TextareaField
                        id={id}
                        label={field.label}
                        placeholder={field.placeholder}
                        error={error}
                        {...register(path)}
                      />
                    </div>
                  );
                }
                return (
                  <TextField
                    key={field.name}
                    id={id}
                    label={field.label}
                    placeholder={field.placeholder}
                    error={error}
                    {...register(path)}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 ? (
        <p className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
          Aún no hay elementos.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={rows.length >= maxRows}
          onClick={() => append(blankRow())}
        >
          <Plus /> {addLabel}
        </Button>
        <Button type="submit" className="h-10 px-6" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
