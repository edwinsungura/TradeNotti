"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { generateDailyInsight } from "@/lib/ai/insight";

export async function generateMyInsight() {
  const user = await requireUser();
  await generateDailyInsight(user.id, true);
  revalidatePath("/today");
  return { ok: true as const };
}
