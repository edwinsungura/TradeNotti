import { startOfMonth, endOfMonth, startOfDay, format } from "date-fns";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { NotebookView, type CalDayVM } from "./notebook-view";

export const dynamic = "force-dynamic";

export default async function NotebookPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await requireUser();
  const { date } = await searchParams;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [trades, entries] = await Promise.all([
    prisma.trade.findMany({
      where: { userId: user.id, entryAt: { gte: monthStart, lte: monthEnd } },
      select: { entryAt: true, pnl: true },
    }),
    prisma.notebookEntry.findMany({
      where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
      orderBy: { date: "desc" },
    }),
  ]);

  // Aggregate per-day P&L + trade count for the month grid.
  const daysInMonth = monthEnd.getDate();
  const entryDays = new Set(entries.map((e) => e.date.getDate()));
  const perDay = new Map<number, { pnl: number; trades: number }>();
  for (const t of trades) {
    if (!t.entryAt) continue;
    const d = t.entryAt.getDate();
    const cur = perDay.get(d) ?? { pnl: 0, trades: 0 };
    cur.pnl += t.pnl ?? 0;
    cur.trades += 1;
    perDay.set(d, cur);
  }

  const calDays: CalDayVM[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const agg = perDay.get(day);
    return {
      day,
      pnl: agg?.pnl ?? 0,
      trades: agg?.trades ?? 0,
      today: day === now.getDate(),
      future: day > now.getDate(),
      hasNote: entryDays.has(day),
    };
  });

  // Selected day editor data
  const selectedDate = date ? startOfDay(new Date(date)) : null;
  const selectedEntry = selectedDate
    ? await prisma.notebookEntry.findFirst({ where: { userId: user.id, date: selectedDate } })
    : null;

  const startDow = (monthStart.getDay() + 6) % 7; // Monday-first offset

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Notebook · {format(now, "MMMM yyyy")}</div>
          <h1 className="oa-page-title">Your trading notebook</h1>
          <p className="t-body" style={{ color: "var(--fg-2)", marginTop: 6 }}>
            A calendar that&apos;s blank until you make it yours. Click any day to write a page — daily breakdowns,
            weekly reviews, recaps.
          </p>
        </div>
      </div>

      <Card>
        <NotebookView
          monthLabel={format(now, "MMMM yyyy")}
          days={calDays}
          startDow={startDow}
          selected={
            selectedDate
              ? {
                  iso: format(selectedDate, "yyyy-MM-dd"),
                  label: format(selectedDate, "EEEE, d MMMM yyyy"),
                  title: selectedEntry?.title ?? "",
                  text:
                    selectedEntry && selectedEntry.content && typeof selectedEntry.content === "object"
                      ? ((selectedEntry.content as { text?: string }).text ?? "")
                      : "",
                }
              : null
          }
          recent={entries.map((e) => ({
            id: e.id,
            iso: format(e.date, "yyyy-MM-dd"),
            label: format(e.date, "EEE d MMM"),
            title: e.title || "Untitled page",
          }))}
        />
      </Card>
    </div>
  );
}
