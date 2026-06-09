"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const numLike = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v == null ? null : Number(String(v).replace(/,/g, ""))))
  .nullable();

const tradeSchema = z.object({
  pair: z.string().trim().min(1).max(24),
  direction: z.enum(["LONG", "SHORT"]),
  assetClass: z.enum(["FOREX", "CRYPTO", "STOCKS", "OTHER"]).default("FOREX"),
  status: z.enum(["OPEN", "CLOSED"]).default("CLOSED"),
  entryPrice: numLike,
  sl: numLike,
  tp: numLike,
  pnl: numLike,
  rr: numLike,
  grade: z.string().trim().max(40).optional().or(z.literal("")),
  setup: z.string().trim().max(2000).optional().or(z.literal("")),
  tags: z.string().optional(),
});

async function ensureAccount(userId: string) {
  const existing = await prisma.account.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.account.create({
    data: { userId, name: "My account", broker: "Manual", currency: "USD", kind: "live" },
  });
}

export async function createTrade(formData: FormData) {
  const user = await requireUser();
  const parsed = tradeSchema.safeParse({
    pair: formData.get("pair"),
    direction: formData.get("direction"),
    assetClass: formData.get("assetClass") || "FOREX",
    status: formData.get("status") || "CLOSED",
    entryPrice: formData.get("entryPrice") ?? "",
    sl: formData.get("sl") ?? "",
    tp: formData.get("tp") ?? "",
    pnl: formData.get("pnl") ?? "",
    rr: formData.get("rr") ?? "",
    grade: formData.get("grade") ?? "",
    setup: formData.get("setup") ?? "",
    tags: formData.get("tags") ?? "",
  });
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid trade" };

  const d = parsed.data;
  const account = await ensureAccount(user.id);

  const tagNames = (d.tags ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  const tagConnections = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name } },
      create: { userId: user.id, name },
      update: {},
    });
    tagConnections.push({ tagId: tag.id });
  }

  await prisma.trade.create({
    data: {
      userId: user.id,
      accountId: account.id,
      pair: d.pair.toUpperCase(),
      direction: d.direction,
      assetClass: d.assetClass,
      status: d.status,
      entryPrice: d.entryPrice,
      sl: d.sl,
      tp: d.tp,
      pnl: d.status === "OPEN" ? null : d.pnl,
      rr: d.status === "OPEN" ? null : d.rr,
      grade: d.grade || null,
      setup: d.setup || null,
      entryAt: new Date(),
      exitAt: d.status === "CLOSED" ? new Date() : null,
      tags: tagConnections.length ? { create: tagConnections } : undefined,
    },
  });

  revalidatePath("/journal");
  revalidatePath("/today");
  revalidatePath("/analytics");
  return { ok: true as const };
}

const missedSchema = z.object({
  pair: z.string().trim().min(1).max(24),
  direction: z.enum(["LONG", "SHORT"]),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
  potential: z.string().trim().max(20).optional().or(z.literal("")),
  grade: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function createMissed(formData: FormData) {
  const user = await requireUser();
  const parsed = missedSchema.safeParse({
    pair: formData.get("pair"),
    direction: formData.get("direction"),
    reason: formData.get("reason") ?? "",
    potential: formData.get("potential") ?? "",
    grade: formData.get("grade") ?? "",
  });
  if (!parsed.success) return { ok: false as const, error: "Invalid details" };
  const d = parsed.data;
  await prisma.missedTrade.create({
    data: {
      userId: user.id,
      pair: d.pair.toUpperCase(),
      direction: d.direction,
      reason: d.reason || null,
      potential: d.potential || null,
      grade: d.grade || null,
    },
  });
  revalidatePath("/journal");
  return { ok: true as const };
}

const backtestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  tradeCount: numLike,
  winRate: numLike,
  avgR: numLike,
  net: numLike,
  period: z.string().trim().max(60).optional().or(z.literal("")),
});

export async function createBacktest(formData: FormData) {
  const user = await requireUser();
  const parsed = backtestSchema.safeParse({
    name: formData.get("name"),
    tradeCount: formData.get("tradeCount") ?? "",
    winRate: formData.get("winRate") ?? "",
    avgR: formData.get("avgR") ?? "",
    net: formData.get("net") ?? "",
    period: formData.get("period") ?? "",
  });
  if (!parsed.success) return { ok: false as const, error: "Invalid details" };
  const d = parsed.data;
  await prisma.backtest.create({
    data: {
      userId: user.id,
      name: d.name,
      tradeCount: Math.round(d.tradeCount ?? 0),
      winRate: d.winRate,
      avgR: d.avgR,
      net: d.net,
      period: d.period || null,
    },
  });
  revalidatePath("/journal");
  return { ok: true as const };
}

export async function deleteTrade(id: string) {
  const user = await requireUser();
  await prisma.trade.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/journal");
  revalidatePath("/today");
  revalidatePath("/analytics");
}
