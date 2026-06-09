"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal("")),
  theme: z.enum(["light", "dark"]).optional(),
  accentPalette: z.enum(["iris", "blue", "emerald", "gold"]).optional(),
  timezone: z.string().trim().max(60).optional().or(z.literal("")),
});

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name") ?? "",
    theme: formData.get("theme") || undefined,
    accentPalette: formData.get("accentPalette") || undefined,
    timezone: formData.get("timezone") ?? "",
  });
  if (!parsed.success) return { ok: false as const };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name || null,
      theme: parsed.data.theme,
      accentPalette: parsed.data.accentPalette,
      timezone: parsed.data.timezone || undefined,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/today");
  return { ok: true as const };
}

const accountSchema = z.object({
  name: z.string().trim().min(1).max(80),
  broker: z.string().trim().max(60).optional().or(z.literal("")),
  currency: z.string().trim().max(8).default("USD"),
  kind: z.enum(["live", "demo", "prop"]).default("live"),
  balance: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function addAccount(formData: FormData) {
  const user = await requireUser();
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    broker: formData.get("broker") ?? "",
    currency: formData.get("currency") || "USD",
    kind: formData.get("kind") || "live",
    balance: formData.get("balance") ?? "",
  });
  if (!parsed.success) return { ok: false as const };
  await prisma.account.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      broker: parsed.data.broker || null,
      currency: parsed.data.currency,
      kind: parsed.data.kind,
      balance: parsed.data.balance || null,
    },
  });
  revalidatePath("/settings");
  return { ok: true as const };
}
