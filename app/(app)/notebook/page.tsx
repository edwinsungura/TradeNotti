import { startOfMonth, endOfMonth, startOfDay, format } from "date-fns";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NotebookView, type NbCell } from "./notebook-view";

export const dynamic = "force-dynamic";

export default async function NotebookPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await requireUser();
  const { date } = await searchParams;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const entries = await prisma.notebookEntry.findMany({
    where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
    orderBy: { date: "asc" },
  });

  const byDay = new Map<number, { id: string; title: string }[]>();
  for (const e of entries) {
    const day = e.date.getDate();
    const list = byDay.get(day) ?? [];
    list.push({ id: e.id, title: e.title || "Untitled" });
    byDay.set(day, list);
  }

  // Sunday-first grid with leading/trailing other-month padding (matches prototype).
  const firstDow = monthStart.getDay(); // 0=Sun
  const daysInMonth = monthEnd.getDate();
  const prevMonthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth(), 0).getDate();
  const cells: NbCell[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: prevMonthEnd - firstDow + 1 + i, other: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      other: false,
      today: d === now.getDate(),
      entries: byDay.get(d) ?? [],
    });
  }
  let trailing = 1;
  while (cells.length % 7) cells.push({ day: trailing++, other: true });

  const monthIso = format(now, "yyyy-MM");

  // Selected day editor
  const selectedDate = date ? startOfDay(new Date(date)) : null;
  const selectedEntry = selectedDate
    ? await prisma.notebookEntry.findFirst({ where: { userId: user.id, date: selectedDate } })
    : null;

  return (
    <NotebookView
      monthLabel={format(now, "MMMM yyyy")}
      monthIso={monthIso}
      cells={cells}
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
    />
  );
}
