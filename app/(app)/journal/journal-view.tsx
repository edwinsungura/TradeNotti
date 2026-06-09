"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, Segmented, Icon, TradeRow, formatMoney, type TradeRowData } from "@/components/ui";

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

function exportCsv(trades: TradeRowData[]) {
  const head = ["Pair", "Direction", "Entry", "SL", "TP", "PnL", "R", "Grade", "Tags", "Date"];
  const rows = trades.map((t) => [
    t.pair,
    t.direction,
    t.entry ?? "",
    t.sl ?? "",
    t.tp ?? "",
    t.pnl ?? "",
    t.rr ?? "",
    t.grade ?? "",
    (t.tags || []).join(" | "),
    t.date ?? "",
  ]);
  const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "tradenotti-trades.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function JournalView({
  trades,
  missed,
  backtests,
}: {
  trades: TradeRowData[];
  missed: Missed[];
  backtests: Backtest[];
}) {
  const [tab, setTab] = useState<"trades" | "missed" | "backtests">("trades");
  const [dir, setDir] = useState("all");

  const filtered = useMemo(() => trades.filter((t) => dir === "all" || t.direction === dir), [trades, dir]);
  const summary = useMemo(() => {
    const closed = filtered.filter((t) => t.status !== "open" && t.pnl != null);
    const net = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const wins = closed.filter((t) => (t.pnl ?? 0) >= 0).length;
    const wr = closed.length ? Math.round((wins / closed.length) * 100) : 0;
    const avgR = closed.length ? closed.reduce((s, t) => s + (t.rr ?? 0), 0) / closed.length : 0;
    return { net, wr, avgR };
  }, [filtered]);

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <h1 className="oa-page-title">Journal</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="oa-btn oa-btn-secondary oa-btn-md">
            <Icon name="filter" size={15} /> Filter
          </button>
          <button className="oa-btn oa-btn-secondary oa-btn-md" onClick={() => exportCsv(filtered)}>
            <Icon name="download" size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="oa-tabs">
        {[
          { id: "trades", label: "Trades", count: trades.length, icon: "list" },
          { id: "missed", label: "Missed trades", count: missed.length, icon: "eye-off" },
          { id: "backtests", label: "Backtests", count: backtests.length, icon: "rewind" },
        ].map((t) => (
          <button key={t.id} className={`oa-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id as typeof tab)}>
            <Icon name={t.icon} size={14} />
            <span>{t.label}</span>
            <span className="oa-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "trades" && (
        <>
          <div className="oa-toolbar">
            <Segmented
              value={dir}
              onChange={setDir}
              options={[
                { value: "all", label: "All" },
                { value: "long", label: "Long" },
                { value: "short", label: "Short" },
              ]}
            />
            <div style={{ flex: 1 }} />
            <div className="oa-toolbar-meta">
              <span>
                <b className={`oa-mono ${summary.net >= 0 ? "profit" : "loss"}`}>
                  {summary.net >= 0 ? "+" : "−"}${Math.abs(summary.net).toLocaleString()}
                </b>{" "}
                net
              </span>
              <span className="oa-mono" style={{ color: "var(--fg-2)" }}>
                {summary.wr}% wr
              </span>
              <span className="oa-mono" style={{ color: "var(--fg-2)" }}>
                {summary.avgR >= 0 ? "+" : ""}
                {summary.avgR.toFixed(2)}R avg
              </span>
              <span className="oa-mono" style={{ color: "var(--fg-3)" }}>
                {filtered.length}/{trades.length}
              </span>
            </div>
          </div>
          <Card padding={0}>
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
              <div>Date</div>
            </div>
            {filtered.length ? (
              filtered.map((t) => (
                <Link key={t.id} href={`/journal/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <TradeRow trade={t} />
                </Link>
              ))
            ) : (
              <div className="jf-empty">
                <Icon name="filter-x" size={22} color="var(--fg-3)" />
                <span>No trades match this filter.</span>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === "missed" && (
        <Card padding={0}>
          <div className="oa-missed-head">
            <div>Pair</div>
            <div>Dir.</div>
            <div>Reason</div>
            <div>Grade</div>
            <div>Potential</div>
            <div>Date</div>
          </div>
          {missed.length ? (
            missed.map((m) => (
              <div key={m.id} className="oa-missed-row">
                <div className="oa-pair">{m.pair}</div>
                <div className={m.direction === "long" ? "profit" : "loss"} style={{ fontWeight: 600 }}>
                  {m.direction === "long" ? "▲" : "▼"}{" "}
                  <span style={{ color: "var(--fg-2)", fontWeight: 500, textTransform: "capitalize", fontSize: 12, marginLeft: 4 }}>
                    {m.direction}
                  </span>
                </div>
                <div className="t-body-sm" style={{ color: "var(--ink)" }}>
                  {m.reason}
                </div>
                <div>
                  {m.grade ? (
                    <span className={`oa-grade oa-grade-${m.grade.toLowerCase().replace(/\s+/g, "-")}`}>{m.grade}</span>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="oa-mono" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                  {m.potential || "—"}
                </div>
                <div className="oa-mono" style={{ color: "var(--fg-2)", fontSize: 12 }}>
                  {m.date}
                </div>
              </div>
            ))
          ) : (
            <div className="oa-sample-hint">
              <Icon name="eye-off" size={15} color="var(--fg-3)" />
              <span>No missed trades logged yet. Use “Log missed trade” on Today to capture the ones that got away.</span>
            </div>
          )}
        </Card>
      )}

      {tab === "backtests" && (
        <div className="oa-grid-2">
          {backtests.map((b) => (
            <Card key={b.id} className="oa-bt-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="overline">{b.period || "—"}</div>
                  <h3 className="oa-card-title" style={{ marginTop: 4 }}>
                    {b.name}
                  </h3>
                </div>
              </div>
              <div className="oa-stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 16 }}>
                <div>
                  <div className="oa-stat-label">Trades</div>
                  <div className="oa-stat-val oa-mono">{b.tradeCount}</div>
                </div>
                <div>
                  <div className="oa-stat-label">Win rate</div>
                  <div className="oa-stat-val oa-mono">{b.winRate != null ? `${b.winRate}%` : "—"}</div>
                </div>
                <div>
                  <div className="oa-stat-label">Avg R</div>
                  <div className="oa-stat-val oa-mono">{b.avgR != null ? `${b.avgR >= 0 ? "+" : ""}${b.avgR.toFixed(2)}R` : "—"}</div>
                </div>
                <div>
                  <div className="oa-stat-label">Net</div>
                  <div className={`oa-stat-val oa-mono ${(b.net ?? 0) >= 0 ? "profit" : "loss"}`}>{formatMoney(b.net)}</div>
                </div>
              </div>
            </Card>
          ))}
          {backtests.length === 0 ? (
            <Card
              style={{
                borderStyle: "dashed",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--fg-3)",
                minHeight: 160,
                textAlign: "center",
              }}
            >
              <span className="t-caption" style={{ maxWidth: 220 }}>
                No backtests yet. Use “Log backtest” on Today — your saved runs appear here as cards.
              </span>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
