import type { Trade, Tag, TradeTag } from "@prisma/client";
import type { TradeRowData } from "@/components/ui";

export type TradeWithTags = Trade & { tags: (TradeTag & { tag: Tag })[] };

/** Human "Today · 09:42" / "Yesterday · 14:30" / "3d ago · 11:55" labels. */
export function relativeLabel(date: Date | null | undefined): string {
  if (!date) return "—";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (days <= 0) return `Today · ${time}`;
  if (days === 1) return `Yesterday · ${time}`;
  return `${days}d ago · ${time}`;
}

function fmtPrice(n: number | null): string | null {
  if (n == null) return null;
  // Keep forex-style precision without trailing-zero loss for big numbers.
  return n >= 1000 ? n.toLocaleString("en-US") : String(n);
}

export function toTradeRow(t: TradeWithTags): TradeRowData {
  return {
    id: t.id,
    pair: t.pair,
    direction: t.direction === "LONG" ? "long" : "short",
    status: t.status === "OPEN" ? "open" : "closed",
    entry: fmtPrice(t.entryPrice),
    sl: fmtPrice(t.sl),
    tp: fmtPrice(t.tp),
    pnl: t.pnl,
    rr: t.rr,
    grade: t.grade,
    tags: t.tags.map((x) => x.tag.name),
    date: relativeLabel(t.entryAt ?? t.createdAt),
  };
}

export function isToday(date: Date | null | undefined): boolean {
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
