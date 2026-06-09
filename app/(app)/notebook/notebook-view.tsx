"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button, Input, Textarea, formatMoney } from "@/components/ui";
import { saveNotebookEntry } from "@/lib/actions/notebook";

export type CalDayVM = {
  day: number;
  pnl: number;
  trades: number;
  today: boolean;
  future: boolean;
  hasNote: boolean;
};

type Selected = { iso: string; label: string; title: string; text: string };
type Recent = { id: string; iso: string; label: string; title: string };

export function NotebookView({
  monthLabel,
  days,
  startDow,
  selected,
  recent,
}: {
  monthLabel: string;
  days: CalDayVM[];
  startDow: number;
  selected: Selected | null;
  recent: Recent[];
}) {
  const router = useRouter();
  const cells: (CalDayVM | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  cells.push(...days);
  while (cells.length % 7) cells.push(null);
  const max = Math.max(1, ...days.map((d) => Math.abs(d.pnl)));

  function openDay(d: CalDayVM) {
    const month = monthLabel; // not used directly; build ISO from current month via router query
    void month;
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
    router.push(`/notebook?date=${iso}`);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1.4fr 1fr" : "1fr", gap: 20 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 className="oa-card-title">{monthLabel}</h3>
        </div>
        <div className="oa-cal">
          <div className="oa-cal-dow">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="oa-cal-grid">
            {cells.map((c, i) => {
              if (!c) return <div key={i} className="oa-cal-cell oa-cal-empty" />;
              const intensity = Math.min(1, Math.abs(c.pnl) / max);
              const isProfit = c.pnl > 0;
              const isLoss = c.pnl < 0;
              const bg = isProfit
                ? `rgba(31, 157, 107, ${0.1 + intensity * 0.6})`
                : isLoss
                  ? `rgba(214, 69, 69, ${0.1 + intensity * 0.6})`
                  : "transparent";
              const border = c.today ? "1.5px solid var(--gold)" : "1px solid var(--line-2)";
              return (
                <div
                  key={i}
                  className={`oa-cal-cell ${c.future ? "future" : ""} ${c.today ? "today" : ""}`}
                  style={{ background: bg, border, cursor: "pointer", position: "relative" }}
                  onClick={() => openDay(c)}
                >
                  <div className="oa-cal-day">{c.day}</div>
                  {c.trades > 0 ? (
                    <>
                      <div className={`oa-cal-pnl ${isProfit ? "profit" : isLoss ? "loss" : ""}`}>
                        {formatMoney(c.pnl, { decimals: 0 })}
                      </div>
                      <div className="oa-cal-trades">
                        {c.trades} {c.trades === 1 ? "trade" : "trades"}
                      </div>
                    </>
                  ) : null}
                  {c.hasNote ? (
                    <span style={{ position: "absolute", top: 6, right: 6, color: "var(--gold-deep)" }}>
                      <Icon name="notebook-pen" size={12} />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {recent.length ? (
            <div style={{ marginTop: 18 }}>
              <div className="overline" style={{ marginBottom: 8 }}>
                Pages this month
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recent.map((r) => (
                  <button
                    key={r.id}
                    className="oa-acct-item"
                    onClick={() => router.push(`/notebook?date=${r.iso}`)}
                    style={{ justifyContent: "flex-start", gap: 10 }}
                  >
                    <Icon name="notebook-pen" size={14} color="var(--gold-deep)" />
                    <span style={{ fontWeight: 600 }}>{r.title}</span>
                    <span style={{ marginLeft: "auto", color: "var(--fg-3)", fontSize: 12 }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {selected ? <DayEditor key={selected.iso} selected={selected} /> : null}
    </div>
  );
}

function DayEditor({ selected }: { selected: Selected }) {
  const router = useRouter();
  const [title, setTitle] = useState(selected.title);
  const [text, setText] = useState(selected.text);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    const fd = new FormData();
    fd.set("date", selected.iso);
    fd.set("title", title);
    fd.set("text", text);
    startTransition(async () => {
      await saveNotebookEntry(fd);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div style={{ borderLeft: "1px solid var(--line-2)", paddingLeft: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="overline">{selected.label}</div>
        <button className="oa-iconbtn" onClick={() => router.push("/notebook")} title="Close">
          <Icon name="x" size={16} />
        </button>
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title (e.g. Daily breakdown)" />
      <div style={{ marginTop: 10 }}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Write your page — what you saw, what you did, what to improve…"
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <Button variant="accent" icon="check" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save page"}
        </Button>
        {saved ? <span style={{ color: "var(--profit)", fontSize: 13 }}>Saved</span> : null}
      </div>
    </div>
  );
}
