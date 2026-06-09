"use server";

import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  date: z.string(),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  text: z.string().max(20000).optional().or(z.literal("")),
});

export async function saveNotebookEntry(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    date: formData.get("date"),
    title: formData.get("title") ?? "",
    text: formData.get("text") ?? "",
  });
  if (!parsed.success) return { ok: false as const };

  const date = startOfDay(new Date(parsed.data.date));
  const content = { text: parsed.data.text ?? "" };

  const existing = await prisma.notebookEntry.findFirst({ where: { userId: user.id, date } });
  if (existing) {
    await prisma.notebookEntry.update({
      where: { id: existing.id },
      data: { title: parsed.data.title || null, content },
    });
  } else {
    await prisma.notebookEntry.create({
      data: { userId: user.id, date, title: parsed.data.title || null, content },
    });
  }
  revalidatePath("/notebook");
  return { ok: true as const };
}
