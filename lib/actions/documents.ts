"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function createDocument(formData: FormData) {
  const user = await requireUser();
  const fromTemplate = String(formData.get("templateId") || "");
  let name = "Untitled document";
  let content: unknown = { text: "" };

  if (fromTemplate) {
    const tpl = await prisma.document.findFirst({ where: { id: fromTemplate, userId: user.id } });
    if (tpl) {
      name = `${tpl.name} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      content = tpl.content ?? { text: "" };
    }
  }

  const doc = await prisma.document.create({
    data: { userId: user.id, name, kind: "doc", content: content as object },
  });
  redirect(`/resources/${doc.id}`);
}

const updateSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(140),
  text: z.string().max(50000).optional().or(z.literal("")),
  saveAsTemplate: z.string().optional(),
});

export async function updateDocument(formData: FormData) {
  const user = await requireUser();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    text: formData.get("text") ?? "",
    saveAsTemplate: formData.get("saveAsTemplate") ?? "",
  });
  if (!parsed.success) return { ok: false as const };

  const owned = await prisma.document.findFirst({ where: { id: parsed.data.id, userId: user.id } });
  if (!owned) return { ok: false as const };

  await prisma.document.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name, content: { text: parsed.data.text ?? "" } },
  });

  if (parsed.data.saveAsTemplate === "1") {
    await prisma.document.create({
      data: {
        userId: user.id,
        kind: "template",
        name: `${parsed.data.name} (template)`,
        content: { text: parsed.data.text ?? "" },
      },
    });
  }

  revalidatePath("/resources");
  revalidatePath(`/resources/${parsed.data.id}`);
  return { ok: true as const };
}

export async function deleteDocument(id: string) {
  const user = await requireUser();
  await prisma.document.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/resources");
  redirect("/resources");
}
