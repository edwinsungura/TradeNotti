"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Segmented, Button, TradeRow, EmptyState, formatMoney, type TradeRowData } from "@/components/ui";
import { LogTradeModal } from "@/components/log-trade-modal";

type Missed = {
  id: string;
  pair: string;
  direction: "long" | "short";
  reason: string | null;
  potential: string | null;
  grade: string | null;
  date: string;
};
type Backtest = {
  id: string;
  name: string;
  tradeCount: number;
  winRate: number | null;
  avgR: number | null;
  net: number | null;
  period: string | null;
};

export function JournalView({
  trades,
  missed,
  backtests,
  initialLog,
}: {
  trades: TradeRowData[];
  missed: Missed[];
  backtests: Backtest[];
  initialLog?: "trade" | "missed" | "backtest";
}) {
  const [tab, setTab] = useState<"trades" | "missed" | "backtests">("trades");
  const [modal, setModal] = useState<null | "trade" | "missed" | "backtest">(initialLog ?? null);

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Journal</div>
          <h1 className="oa-page-title">Your trades</h1>
        </div>
        <Button variant="accent" icon="plus" onClick={() => setModal("trade")}>
          Log trade
        </Button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v as typeof tab)}
          options={[
            { value: "trades", label: `Trades (${trades.length})` },
            { value: "missed", label: `Missed (${missed.length})` },
            { value: "backtests", label: `Backtests (${backtests.length})` },
          ]}
        />
      </div>

      {tab === "trades" && (
        <Card padding={0}>
          {trades.length ? (
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
              {trades.map((t) => (
                <Link key={t.id} href={`/journal/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <TradeRow trade={t} />
                </Link>
              ))}
            </>
          ) : (
            <EmptyState
              icon="inbox"
              title="No trades yet."
              body="Log your first trade to start building your journal."
              action={
                <Button variant="accent" icon="plus" onClick={() => setModal("trade")}>
                  Log trade
                </Button>
              }
            />
          )}
        </Card>
      )}

      {tab === "missed" && (
        <Card padding={0}>
          {missed.length ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {missed.map((m) => (
                <div key={m.id} className="oa-trow" style={{ gridTemplateColumns: "1fr 0.6fr 2fr 0.8fr 0.8fr" }}>
                  <span className="oa-pair">{m.pair}</span>
                  <span className={m.direction === "long" ? "profit" : "loss"} style={{ textTransform: "capitalize" }}>
                    {m.direction}
                  </span>
                  <span style={{ color: "var(--fg-2)" }}>{m.reason || "—"}</span>
                  <span className="oa-mono">{m.potential || "—"}</span>
                  <span className="oa-trow-date">{m.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="eye-off"
              title="No missed trades logged."
              body="Log the trades you should have taken — they're often the most instructive."
              action={
                <Button variant="secondary" icon="plus" onClick={() => setModal("missed")}>
                  Log missed trade
                </Button>
              }
            />
          )}
        </Card>
      )}

      {tab === "backtests" && (
        <Card padding={0}>
          {backtests.length ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {backtests.map((b) => (
                <div key={b.id} className="oa-trow" style={{ gridTemplateColumns: "2fr 0.7fr 0.7fr 0.7fr 1fr 1fr" }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{b.name}</span>
                  <span className="oa-mono">{b.tradeCount}</span>
                  <span className="oa-mono">{b.winRate != null ? `${b.winRate}%` : "—"}</span>
                  <span className="oa-mono">{b.avgR != null ? `${b.avgR}R` : "—"}</span>
                  <span className={`oa-mono ${(b.net ?? 0) >= 0 ? "profit" : "loss"}`}>{formatMoney(b.net)}</span>
                  <span className="oa-trow-date">{b.period || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="rewind"
              title="No backtests yet."
              body="Record the results of setups you're building so you can trust them live."
              action={
                <Button variant="secondary" icon="plus" onClick={() => setModal("backtest")}>
                  Log backtest
                </Button>
              }
            />
          )}
        </Card>
      )}

      {modal ? <LogTradeModal initialMode={modal} onClose={() => setModal(null)} /> : null}
    </div>
  );
}
