import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { toTradeRow } from "@/lib/view";
import { relativeLabel } from "@/lib/view";
import { JournalView } from "./journal-view";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ log?: string }>;
}) {
  const user = await requireUser();
  const { log } = await searchParams;

  const [trades, missed, backtests] = await Promise.all([
    prisma.trade.findMany({
      where: { userId: user.id },
      include: { tags: { include: { tag: true } } },
      orderBy: { entryAt: "desc" },
    }),
    prisma.missedTrade.findMany({ where: { userId: user.id }, orderBy: { occurredAt: "desc" } }),
    prisma.backtest.findMany({ where: { userId: user.id }, orderBy: { id: "desc" } }),
  ]);

  return (
    <JournalView
      trades={trades.map(toTradeRow)}
      missed={missed.map((m) => ({
        id: m.id,
        pair: m.pair,
        direction: m.direction === "LONG" ? "long" : "short",
        reason: m.reason,
        potential: m.potential,
        grade: m.grade,
        date: relativeLabel(m.occurredAt),
      }))}
      backtests={backtests.map((b) => ({
        id: b.id,
        name: b.name,
        tradeCount: b.tradeCount,
        winRate: b.winRate,
        avgR: b.avgR,
        net: b.net,
        period: b.period,
      }))}
      initialLog={log === "missed" || log === "backtest" || log === "trade" ? log : undefined}
    />
  );
}
