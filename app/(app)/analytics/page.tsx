import { startOfMonth, endOfMonth, subDays, format } from "date-fns";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, KpiCard, EquityCurve, WinRateRing, EmptyState, CalendarMonth, type CalDay } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { computeStats, equityCurve, type StatTrade } from "@/lib/stats";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default async function AnalyticsPage() {
  const user = await requireUser();
  const now = new Date();

  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    include: { tags: { include: { tag: true } } },
    orderBy: { entryAt: "asc" },
  });

  const toStat = (t: (typeof trades)[number]): StatTrade => ({
    pnl: t.pnl,
    rr: t.rr,
    status: t.status === "OPEN" ? "open" : "closed",
  });

  const s = computeStats(trades.map(toStat));

  if (s.closedCount === 0) {
    return (
      <div className="oa-page">
        <div className="oa-page-header">
          <div>
            <div className="overline">Performance · {format(now, "MMMM yyyy")}</div>
            <h1 className="oa-page-title">Analytics</h1>
          </div>
        </div>
        <Card>
          <EmptyState
            icon="layout-dashboard"
            title="No closed trades yet."
            body="Once you've logged some closed trades, your win rate, average R, equity curve, distribution and performance calendar show up here."
          />
        </Card>
      </div>
    );
  }

  // Previous-period deltas (last 30d vs the 30d before that).
  const cutA = subDays(now, 30);
  const cutB = subDays(now, 60);
  const recent = trades.filter((t) => (t.entryAt ?? t.createdAt) >= cutA);
  const prior = trades.filter((t) => {
    const d = t.entryAt ?? t.createdAt;
    return d >= cutB && d < cutA;
  });
  const sRecent = computeStats(recent.map(toStat));
  const sPrior = computeStats(prior.map(toStat));

  const curve = equityCurve(trades.map(toStat), 10000);

  // Equity-curve date axis (5 labels across the closed-trade range).
  const closedDated = trades.filter((t) => t.status !== "OPEN" && t.pnl != null);
  const first = closedDated[0]?.entryAt ?? startOfMonth(now);
  const axis = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(first.getTime() + ((now.getTime() - first.getTime()) * i) / 4);
    return i === 4 ? "Today" : format(d, "MMM d");
  });

  // Win/loss distribution
  const openCount = trades.filter((t) => t.status === "OPEN").length;

  // Best & worst setups — attribute each closed trade's P&L to its tags.
  const tagAgg = new Map<string, { net: number; wins: number; n: number }>();
  for (const t of trades) {
    if (t.status === "OPEN" || t.pnl == null) continue;
    for (const tt of t.tags) {
      const a = tagAgg.get(tt.tag.name) ?? { net: 0, wins: 0, n: 0 };
      a.net += t.pnl;
      a.n += 1;
      if (t.pnl >= 0) a.wins += 1;
      tagAgg.set(tt.tag.name, a);
    }
  }
  const setups = [...tagAgg.entries()]
    .map(([name, a]) => ({ name, wr: Math.round((a.wins / a.n) * 100), net: a.net }))
    .sort((a, b) => b.net - a.net)
    .slice(0, 5);

  // P&L by weekday (Mon–Fri)
  const byDay = [0, 0, 0, 0, 0];
  for (const t of trades) {
    if (t.status === "OPEN" || t.pnl == null) continue;
    const dow = (t.entryAt ?? t.createdAt).getDay(); // 0=Sun..6=Sat
    if (dow >= 1 && dow <= 5) byDay[dow - 1] += t.pnl;
  }
  const dayMax = Math.max(1, ...byDay.map((v) => Math.abs(v)));

  // Performance calendar (current month, Monday-first)
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const perDay = new Map<number, { pnl: number; trades: number }>();
  for (const t of trades) {
    const d = t.entryAt ?? t.createdAt;
    if (d < monthStart || d > monthEnd || t.pnl == null) continue;
    const day = d.getDate();
    const cur = perDay.get(day) ?? { pnl: 0, trades: 0 };
    cur.pnl += t.pnl;
    cur.trades += 1;
    perDay.set(day, cur);
  }
  const calDays: CalDay[] = Array.from({ length: monthEnd.getDate() }, (_, i) => {
    const day = i + 1;
    const agg = perDay.get(day);
    return { day, pnl: agg?.pnl ?? 0, trades: agg?.trades ?? 0, today: day === now.getDate(), future: day > now.getDate() };
  });
  const monthStartDow = (monthStart.getDay() + 6) % 7;

  const delta = (cur: number, prev: number) => {
    if (prev === 0) return null;
    const pct = ((cur - prev) / Math.abs(prev)) * 100;
    return `${pct >= 0 ? "" : ""}${pct.toFixed(1)}% vs prev`;
  };

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Performance · {format(now, "MMMM yyyy")}</div>
          <h1 className="oa-page-title">Analytics</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="oa-seg oa-seg-md">
            <button type="button">Week</button>
            <button type="button" className="on">
              Month
            </button>
            <button type="button">YTD</button>
            <button type="button">All</button>
          </div>
          <PrintButton />
        </div>
      </div>

      <div className="oa-grid-3">
        <KpiCard
          overline="Net P&L"
          value={formatMoney(s.netPnl)}
          valueClass={s.netPnl >= 0 ? "profit" : "loss"}
          delta={delta(sRecent.netPnl, sPrior.netPnl) ?? undefined}
          deltaKind={sRecent.netPnl >= sPrior.netPnl ? "profit" : "loss"}
        />
        <KpiCard
          overline="Win rate"
          value={`${Math.round(s.winRate * 100)}%`}
          delta={sPrior.closedCount ? `prev ${Math.round(sPrior.winRate * 100)}%` : undefined}
          deltaKind={sRecent.winRate >= sPrior.winRate ? "profit" : "loss"}
          footnote={`${s.wins + s.losses} of ${s.closedCount + openCount} closed`}
        />
        <KpiCard
          overline="Avg RR"
          value={`${s.avgR >= 0 ? "+" : ""}${s.avgR.toFixed(2)}R`}
          delta={sPrior.closedCount ? `prev ${sPrior.avgR >= 0 ? "+" : ""}${sPrior.avgR.toFixed(2)}R` : undefined}
          deltaKind={sRecent.avgR >= sPrior.avgR ? "profit" : "loss"}
        />
      </div>

      <div className="oa-grid-12" style={{ marginTop: 16 }}>
        <Card style={{ gridColumn: "span 8" }}>
          <CardHeader overline="Equity curve · MTD" title="Account equity" />
          <div style={{ marginTop: 8 }}>
            <EquityCurve points={curve} height={220} accent="var(--gold-deep)" fill="var(--gold-soft)" />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--fg-3)",
            }}
          >
            {axis.map((a, i) => (
              <span key={i}>{a}</span>
            ))}
          </div>
        </Card>

        <Card style={{ gridColumn: "span 4" }}>
          <CardHeader overline="Distribution" title="Win / loss" />
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
            <WinRateRing value={s.winRate} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="oa-distrow">
                <span className="oa-dot" style={{ background: "var(--profit)" }} />
                <span className="t-body-sm">Wins</span>
                <b className="oa-mono">{s.wins}</b>
              </div>
              <div className="oa-distrow">
                <span className="oa-dot" style={{ background: "var(--loss)" }} />
                <span className="t-body-sm">Losses</span>
                <b className="oa-mono">{s.losses}</b>
              </div>
              <div className="oa-distrow">
                <span className="oa-dot" style={{ background: "var(--info)" }} />
                <span className="t-body-sm">Open</span>
                <b className="oa-mono">{openCount}</b>
              </div>
              <div className="oa-distrow">
                <span className="oa-dot" style={{ background: "var(--stone-300)" }} />
                <span className="t-body-sm">Break-even</span>
                <b className="oa-mono">{s.breakeven}</b>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="oa-grid-12" style={{ marginTop: 16 }}>
        <Card style={{ gridColumn: "span 6" }}>
          <CardHeader overline="Edge" title="Best & worst setups" />
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {setups.length ? (
              setups.map((st) => (
                <div key={st.name} className="oa-setup-row">
                  <div className="oa-setup-name">{st.name}</div>
                  <div className="oa-mono" style={{ color: "var(--fg-2)", fontSize: 12 }}>
                    {st.wr}% wr
                  </div>
                  <div className={`oa-mono ${st.net >= 0 ? "profit" : "loss"}`} style={{ fontWeight: 600 }}>
                    {formatMoney(st.net)}
                  </div>
                </div>
              ))
            ) : (
              <p className="t-body-sm" style={{ color: "var(--fg-2)" }}>
                Tag your trades to see which setups make and lose you money.
              </p>
            )}
          </div>
        </Card>

        <Card style={{ gridColumn: "span 6" }}>
          <CardHeader overline="By day" title="P&L distribution" />
          <div className="oa-pnl-bars" style={{ marginTop: 18 }}>
            {byDay.map((p, i) => {
              const h = (Math.abs(p) / dayMax) * 140;
              return (
                <div key={i} className="oa-pnl-bar-col">
                  <div className="oa-pnl-bar-wrap" style={{ height: 160 }}>
                    {p >= 0 ? <div className="oa-pnl-bar pos" style={{ height: h + "px" }} /> : null}
                    <div className="oa-pnl-bar-axis" />
                    {p < 0 ? <div className="oa-pnl-bar neg" style={{ height: h + "px" }} /> : null}
                  </div>
                  <div className="oa-pnl-bar-label">{WEEKDAYS[i]}</div>
                  <div className={`oa-pnl-bar-val oa-mono ${p >= 0 ? "profit" : "loss"}`}>
                    {formatMoney(p, { showSign: false, decimals: 0 })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }} padding={20}>
        <CardHeader overline={format(now, "MMMM yyyy")} title="Performance calendar" />
        <div style={{ marginTop: 16 }}>
          <CalendarMonth days={calDays} colored startDow={monthStartDow} />
        </div>
        <div className="oa-cal-legend">
          <div>
            <span className="oa-cal-swatch profit" /> Profit day · darker = larger move
          </div>
          <div>
            <span className="oa-cal-swatch loss" /> Loss day
          </div>
          <div>
            <span className="oa-cal-swatch neutral" /> Break-even / scratched
          </div>
          <div>
            <span className="oa-cal-swatch today" /> Today
          </div>
        </div>
      </Card>
    </div>
  );
}
