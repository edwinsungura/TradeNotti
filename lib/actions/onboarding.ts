"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  focus: z.enum(["forex", "crypto", "stocks", "mixed"]).default("forex"),
  pairs: z.array(z.string().min(1).max(16)).max(40).default([]),
  rules: z.array(z.object({ text: z.string().min(1).max(240), category: z.string().min(1).max(40) })).max(20).default([]),
});

export async function completeOnboarding(input: {
  focus: string;
  pairs: string[];
  rules: { text: string; category: string }[];
}) {
  const user = await requireUser();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      tradingFocus: parsed.data.focus,
      watchlist: parsed.data.pairs,
      onboardedAt: new Date(),
    },
  });

  // Seed the selected starter rules (skip if the user already has rules).
  const existing = await prisma.rule.count({ where: { userId: user.id } });
  if (existing === 0 && parsed.data.rules.length) {
    await prisma.rule.createMany({
      data: parsed.data.rules.map((r, i) => ({
        userId: user.id,
        text: r.text,
        category: r.category,
        active: true,
        order: i,
      })),
    });
  }

  return { ok: true as const };
}
