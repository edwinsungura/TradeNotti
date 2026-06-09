import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, KpiCard, EquityCurve, WinRateRing, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { computeStats, equityCurve, pnlByKey } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    orderBy: { entryAt: "asc" },
  });

  const stat = trades.map((t) => ({ pnl: t.pnl, rr: t.rr, status: t.status === "OPEN" ? "open" : "closed" }));
  const s = computeStats(stat);
  const curve = equityCurve(stat, 10000);

  const byPair = pnlByKey(
    trades.map((t) => ({ pnl: t.pnl, status: t.status === "OPEN" ? "open" : "closed", pair: t.pair })),
    (t) => t.pair,
  );
  const pairRows = Object.entries(byPair).sort((a, b) => b[1] - a[1]);

  if (s.closedCount === 0) {
    return (
      <div className="oa-page">
        <div className="oa-page-header">
          <div>
            <div className="overline">Review</div>
            <h1 className="oa-page-title">Analytics</h1>
          </div>
        </div>
        <Card>
          <EmptyState
            icon="layout-dashboard"
            title="No closed trades yet."
            body="Once you've logged some closed trades, your win rate, average R, equity curve and per-pair breakdown show up here."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Review</div>
          <h1 className="oa-page-title">Analytics</h1>
        </div>
      </div>

      <div className="oa-grid-12" style={{ gap: 16 }}>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard
            overline="Net P&L"
            value={formatMoney(s.netPnl)}
            valueClass={s.netPnl >= 0 ? "profit" : "loss"}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard overline="Avg R" value={`${s.avgR >= 0 ? "+" : ""}${s.avgR.toFixed(2)}R`} valueClass={s.avgR >= 0 ? "profit" : "loss"} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard overline="Profit factor" value={s.profitFactor == null ? "∞" : s.profitFactor.toFixed(2)} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KpiCard overline="Max drawdown" value={formatMoney(-s.maxDrawdown)} valueClass="loss" />
        </div>

        {/* Equity curve */}
        <Card style={{ gridColumn: "span 8" }}>
          <CardHeader overline="Performance" title="Equity curve" />
          <div style={{ marginTop: 8 }}>
            <EquityCurve points={curve} height={220} accent="var(--gold-deep)" fill="var(--gold-soft)" />
          </div>
        </Card>

        {/* Win rate ring */}
        <Card style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="overline" style={{ alignSelf: "flex-start" }}>
            Win rate
          </div>
          <div style={{ margin: "12px 0" }}>
            <WinRateRing value={s.winRate} size={132} stroke={14} />
          </div>
          <div className="t-body" style={{ color: "var(--fg-2)" }}>
            <span className="profit">{s.wins}W</span> / <span className="loss">{s.losses}L</span>
            {s.breakeven ? ` · ${s.breakeven} BE` : ""}
          </div>
        </Card>

        {/* P&L by pair */}
        <Card style={{ gridColumn: "span 12" }} padding={0}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line-2)" }}>
            <div className="overline">Breakdown</div>
            <h3 className="oa-card-title" style={{ marginTop: 4 }}>
              P&amp;L by pair
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {pairRows.map(([pair, pnl]) => (
              <div
                key={pair}
                className="oa-trow"
                style={{ gridTemplateColumns: "1fr 3fr 0.8fr" }}
              >
                <span className="oa-pair">{pair}</span>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: pnl >= 0 ? "var(--profit)" : "var(--loss)",
                      width: `${Math.min(100, (Math.abs(pnl) / Math.max(...pairRows.map(([, v]) => Math.abs(v)))) * 100)}%`,
                      minWidth: 6,
                    }}
                  />
                </span>
                <span className={`oa-mono ${pnl >= 0 ? "profit" : "loss"}`} style={{ textAlign: "right" }}>
                  {formatMoney(pnl)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
