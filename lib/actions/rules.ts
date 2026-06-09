"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const addSchema = z.object({
  text: z.string().trim().min(3).max(240),
  category: z.string().trim().min(1).max(40).default("Risk"),
});

export async function addRule(formData: FormData) {
  const user = await requireUser();
  const parsed = addSchema.safeParse({
    text: formData.get("text"),
    category: formData.get("category") || "Risk",
  });
  if (!parsed.success) return;

  const count = await prisma.rule.count({ where: { userId: user.id } });
  await prisma.rule.create({
    data: { userId: user.id, text: parsed.data.text, category: parsed.data.category, order: count },
  });
  revalidatePath("/rules");
  revalidatePath("/today");
}

export async function toggleRule(id: string) {
  const user = await requireUser();
  const rule = await prisma.rule.findFirst({ where: { id, userId: user.id } });
  if (!rule) return;
  await prisma.rule.update({ where: { id }, data: { active: !rule.active } });
  revalidatePath("/rules");
  revalidatePath("/today");
}

export async function deleteRule(id: string) {
  const user = await requireUser();
  await prisma.rule.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/rules");
  revalidatePath("/today");
}
