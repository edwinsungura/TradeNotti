import Link from "next/link";
import { startOfDay } from "date-fns";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, Icon, TradeRow, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { toTradeRow, isToday } from "@/lib/view";
import { InsightGenerate } from "@/components/insight-generate";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await requireUser();
  const today = startOfDay(new Date());

  const [trades, insight, rules] = await Promise.all([
    prisma.trade.findMany({
      where: { userId: user.id },
      include: { tags: { include: { tag: true } } },
      orderBy: { entryAt: "desc" },
    }),
    prisma.insight.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    prisma.rule.findMany({ where: { userId: user.id, active: true }, orderBy: { order: "asc" } }),
  ]);

  const todays = trades.filter((t) => isToday(t.entryAt ?? t.createdAt));
  const todayPnl = todays.reduce((s, t) => s + (t.pnl ?? 0), 0);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">{dateLabel}</div>
          <h1 className="oa-page-title">
            {greeting}, {user.name || "trader"}.
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="overline">P&amp;L today</div>
          <div
            className="oa-kpi-value"
            style={{ color: todayPnl > 0 ? "var(--profit)" : todayPnl < 0 ? "var(--loss)" : "var(--ink)" }}
          >
            {formatMoney(todayPnl)}
          </div>
        </div>
      </div>

      <div className="oa-grid-12">
        {/* Daily AI insight */}
        <Card style={{ gridColumn: "span 8", background: "var(--gold-wash)", borderColor: "var(--gold)" }}>
          <div className="overline" style={{ color: "var(--stone-700)" }}>
            Daily insight{insight?.tag ? ` · ${insight.tag}` : ""}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="sparkles" size={18} color="var(--ink)" />
            </div>
            <p className="t-body" style={{ margin: 0, color: "var(--stone-700)" }}>
              {insight?.content ??
                "Your daily insight is generated each morning from your recent trades, rules, and stats. Log a few trades and check back tomorrow."}
            </p>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            {insight ? (
              <Link href="/analytics" className="oa-btn oa-btn-primary oa-btn-md">
                See report <Icon name="arrow-right" size={16} />
              </Link>
            ) : (
              <InsightGenerate />
            )}
          </div>
        </Card>

        {/* Quick log */}
        <Card style={{ gridColumn: "span 4" }}>
          <div className="overline">Quick log</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/journal?log=trade" className="oa-btn oa-btn-accent oa-btn-md" style={{ width: "100%", justifyContent: "center" }}>
              <Icon name="plus" size={16} /> Log trade
            </Link>
            <Link href="/journal?log=missed" className="oa-btn oa-btn-secondary oa-btn-md" style={{ width: "100%", justifyContent: "center" }}>
              <Icon name="eye-off" size={16} /> Log missed trade
            </Link>
            <Link href="/journal?log=backtest" className="oa-btn oa-btn-ghost oa-btn-md" style={{ width: "100%", justifyContent: "center" }}>
              <Icon name="rewind" size={16} /> Log backtest
            </Link>
          </div>
        </Card>
      </div>

      {/* Today's trades */}
      <Card padding={0} style={{ marginTop: 16 }}>
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--line-2)",
          }}
        >
          <div>
            <div className="overline">Logged today</div>
            <h3 className="oa-card-title" style={{ marginTop: 4 }}>
              Today&apos;s trades
            </h3>
          </div>
          <Link href="/journal" className="oa-btn oa-btn-ghost oa-btn-md">
            Open journal <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        {todays.length > 0 ? (
          <>
            <div className="oa-trow-head">
              <div>Pair</div>
              <div>Dir.</div>
              <div>Entry</div>
              <div>SL</div>
              <div>TP</div>
              <div>P&amp;L</div>
              <div>R</div>
              <div>Grade</div>
              <div>Tags</div>
              <div>Time</div>
            </div>
            {todays.map((t) => (
              <Link key={t.id} href={`/journal/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <TradeRow trade={toTradeRow(t)} />
              </Link>
            ))}
          </>
        ) : (
          <EmptyState
            icon="inbox"
            title="No trades logged today."
            body="Just took one? Log it now while the setup is fresh."
            action={
              <Link href="/journal?log=trade" className="oa-btn oa-btn-accent oa-btn-md">
                <Icon name="plus" size={16} /> Log trade
              </Link>
            }
          />
        )}
      </Card>

      {/* Trading rules */}
      <Card style={{ marginTop: 16 }}>
        <CardHeader
          title="Trading rules"
          action={
            <Link href="/rules" className="oa-btn oa-btn-ghost oa-btn-md">
              Edit rules <Icon name="arrow-right" size={16} />
            </Link>
          }
        />
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {rules.slice(0, 4).map((r) => (
            <div key={r.id} className="oa-rule-row">
              <span className="oa-rule-check">
                <Icon name="check" size={12} color="white" />
              </span>
              <span className="oa-rule-text">{r.text}</span>
              <span className="oa-rule-cat">{r.category}</span>
            </div>
          ))}
          {rules.length === 0 ? (
            <p className="t-body" style={{ color: "var(--fg-2)", gridColumn: "span 2" }}>
              No rules yet. <Link href="/rules">Add your trading rules →</Link>
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
