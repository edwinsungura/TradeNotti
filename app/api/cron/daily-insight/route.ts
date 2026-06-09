import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDailyInsight } from "@/lib/ai/insight";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Generates one insight per user per day. Protected by CRON_SECRET, supplied
 * either as `Authorization: Bearer <secret>` (Vercel Cron) or `?secret=`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const provided = req.headers.get("authorization")?.replace("Bearer ", "") || url.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only users who have engaged (onboarded or have at least one trade).
  const users = await prisma.user.findMany({
    where: { OR: [{ onboardedAt: { not: null } }, { trades: { some: {} } }] },
    select: { id: true },
  });

  let created = 0;
  let skipped = 0;
  for (const u of users) {
    try {
      const res = await generateDailyInsight(u.id);
      if (res.created) created++;
      else skipped++;
    } catch (err) {
      console.error(`daily-insight failed for user ${u.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, users: users.length, created, skipped });
}
