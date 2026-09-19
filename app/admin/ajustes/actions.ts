"use server";

import { failure, success, validationFailure, type ActionResult } from "@/lib/actions/result";
import { dbFailure, publish, withAdmin } from "@/lib/admin/action-helpers";
import { SETTING_SCHEMAS, isSettingKey } from "@/lib/validation/settings";

/**
 * Guarda una sección de los ajustes públicos. El valor se valida con el mismo
 * esquema con el que la tienda lo lee: un valor mal formado nunca llega a la base
 * (una fila inválida tumbaría todas las páginas).
 */
export async function saveSetting(key: string, value: unknown): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    if (!isSettingKey(key)) return failure("Ajuste desconocido.");
    const parsed = SETTING_SCHEMAS[key].safeParse(value);
    if (!parsed.success) return validationFailure(parsed.error);

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: parsed.data }, { onConflict: "key" });
    if (error) return dbFailure(error);
    publish("settings");
    return success();
  });
}
