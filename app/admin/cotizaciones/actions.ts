"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, success, type ActionResult } from "@/lib/actions/result";
import { dbFailure, withAdmin } from "@/lib/admin/action-helpers";
import { REQUEST_STATUSES } from "@/lib/admin/status";

const statusSchema = z.object({ id: z.uuid(), status: z.enum(REQUEST_STATUSES) });

export async function setQuoteStatus(id: string, status: string): Promise<ActionResult<void>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = statusSchema.safeParse({ id, status });
    if (!parsed.success) return failure("Estado no válido.");

    const { error } = await supabase
      .from("quotes")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);
    if (error) return dbFailure(error);
    revalidatePath("/admin", "layout");
    return success();
  });
}
