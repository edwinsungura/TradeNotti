"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button, Field, Input, Textarea, Select, Segmented } from "@/components/ui";
import { createTrade, createMissed, createBacktest } from "@/lib/actions/trades";

type Mode = "trade" | "missed" | "backtest";

export function LogTradeModal({ initialMode = "trade", onClose }: { initialMode?: Mode; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [direction, setDirection] = useState("LONG");
  const [status, setStatus] = useState("CLOSED");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("direction", direction);
    fd.set("status", status);
    startTransition(async () => {
      const action = mode === "trade" ? createTrade : mode === "missed" ? createMissed : createBacktest;
      const res = await action(fd);
      if (res && !res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,12,16,0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "8vh 16px 16px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="oa-card"
        style={{ width: "100%", maxWidth: 560, padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--line-2)",
          }}
        >
          <h3 className="oa-card-title">Log to journal</h3>
          <button className="oa-iconbtn" onClick={onClose} title="Close">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            options={[
              { value: "trade", label: "Trade" },
              { value: "missed", label: "Missed" },
              { value: "backtest", label: "Backtest" },
            ]}
          />

          <form onSubmit={submit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "trade" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Pair">
                    <Input name="pair" required placeholder="EUR/USD" />
                  </Field>
                  <Field label="Asset class">
                    <Select
                      name="assetClass"
                      defaultValue="FOREX"
                      options={[
                        { value: "FOREX", label: "Forex" },
                        { value: "CRYPTO", label: "Crypto" },
                        { value: "STOCKS", label: "Stocks / indices" },
                        { value: "OTHER", label: "Other" },
                      ]}
                    />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Direction">
                    <Segmented
                      value={direction}
                      onChange={setDirection}
                      options={[
                        { value: "LONG", label: "Long" },
                        { value: "SHORT", label: "Short" },
                      ]}
                    />
                  </Field>
                  <Field label="Status">
                    <Segmented
                      value={status}
                      onChange={setStatus}
                      options={[
                        { value: "CLOSED", label: "Closed" },
                        { value: "OPEN", label: "Open" },
                      ]}
                    />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <Field label="Entry">
                    <Input name="entryPrice" mono placeholder="1.08412" />
                  </Field>
                  <Field label="Stop loss">
                    <Input name="sl" mono placeholder="1.08260" />
                  </Field>
                  <Field label="Take profit">
                    <Input name="tp" mono placeholder="1.08720" />
                  </Field>
                </div>
                {status === "CLOSED" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="P&L ($)">
                      <Input name="pnl" mono placeholder="245" />
                    </Field>
                    <Field label="R multiple">
                      <Input name="rr" mono placeholder="2.0" />
                    </Field>
                  </div>
                )}
                <Field label="Grade">
                  <Select
                    name="grade"
                    defaultValue="High probability"
                    options={[
                      { value: "High probability", label: "High probability" },
                      { value: "Low probability", label: "Low probability" },
                    ]}
                  />
                </Field>
                <Field label="Tags" hint="Comma-separated, e.g. Breakout, London open">
                  <Input name="tags" placeholder="Breakout, A+ setup" />
                </Field>
                <Field label="Notes / setup">
                  <Textarea name="setup" rows={3} placeholder="What was your read on the market?" />
                </Field>
              </>
            )}

            {mode === "missed" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Pair">
                    <Input name="pair" required placeholder="XAU/USD" />
                  </Field>
                  <Field label="Direction">
                    <Segmented
                      value={direction}
                      onChange={setDirection}
                      options={[
                        { value: "LONG", label: "Long" },
                        { value: "SHORT", label: "Short" },
                      ]}
                    />
                  </Field>
                </div>
                <Field label="Potential" hint="e.g. +2.4R">
                  <Input name="potential" placeholder="+2.4R" />
                </Field>
                <Field label="Why did you miss it?">
                  <Textarea name="reason" rows={3} placeholder="Hesitated at entry / broke a rule / wasn't watching…" />
                </Field>
              </>
            )}

            {mode === "backtest" && (
              <>
                <Field label="Name">
                  <Input name="name" required placeholder="London ORB · EUR/USD · 2024 Q1" />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Trades">
                    <Input name="tradeCount" mono placeholder="64" />
                  </Field>
                  <Field label="Win rate (%)">
                    <Input name="winRate" mono placeholder="58" />
                  </Field>
                  <Field label="Avg R">
                    <Input name="avgR" mono placeholder="0.74" />
                  </Field>
                  <Field label="Net ($)">
                    <Input name="net" mono placeholder="4820" />
                  </Field>
                </div>
                <Field label="Period">
                  <Input name="period" placeholder="Jan–Mar 2024" />
                </Field>
              </>
            )}

            {error ? <div style={{ color: "var(--loss)", fontSize: 13 }}>{error}</div> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
