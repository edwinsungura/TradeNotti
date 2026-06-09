"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, Button, Input, Textarea } from "@/components/ui";
import { saveNotebookEntry } from "@/lib/actions/notebook";

export type NbCell = {
  day: number;
  other?: boolean;
  today?: boolean;
  entries?: { id: string; title: string }[];
};

type Selected = { iso: string; label: string; title: string; text: string };

export function NotebookView({
  monthLabel,
  monthIso,
  cells,
  selected,
}: {
  monthLabel: string;
  monthIso: string;
  cells: NbCell[];
  selected: Selected | null;
}) {
  const router = useRouter();

  const openDay = (day: number) => router.push(`/notebook?date=${monthIso}-${String(day).padStart(2, "0")}`);
  const todayDay = cells.find((c) => c.today)?.day;

  return (
    <div className="oa-page" style={{ maxWidth: "none" }}>
      <div className="oa-page-header">
        <div>
          <h1 className="oa-page-title">Notebook</h1>
          <p className="t-body-sm" style={{ color: "var(--fg-2)", marginTop: 8, maxWidth: 560 }}>
            A blank master calendar. Click the <b>+</b> on any day to write — start from a template or a blank page,
            save your own templates, and customize every part of the page.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="overline" style={{ marginRight: 8 }}>
            {monthLabel}
          </span>
          <button className="oa-iconbtn">
            <Icon name="chevron-left" size={18} />
          </button>
          <Button variant="secondary" onClick={() => todayDay && openDay(todayDay)}>
            Today
          </Button>
          <button className="oa-iconbtn">
            <Icon name="chevron-right" size={18} />
          </button>
          <Button variant="accent" icon="plus" onClick={() => todayDay && openDay(todayDay)}>
            New
          </Button>
        </div>
      </div>

      <div className="nb-cal">
        <div className="nb-cal-dow">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="nb-cal-grid">
          {cells.map((c, i) => (
            <div key={i} className={`nb-day ${c.other ? "other" : ""} ${c.today ? "today" : ""}`}>
              <div className="nb-day-top">
                {!c.other ? (
                  <button className="nb-day-add" onClick={() => openDay(c.day)} title="Add an entry">
                    <Icon name="plus" size={14} />
                  </button>
                ) : (
                  <span />
                )}
                <span className="nb-day-num">{c.day}</span>
              </div>
              <div className="nb-day-list">
                {(c.entries ?? []).map((e) => (
                  <div key={e.id} className="nb-chip" onClick={() => openDay(c.day)}>
                    <div className="nb-chip-head">
                      <span className="nb-chip-icon">
                        <Icon name="notebook-pen" size={12} />
                      </span>
                      <span className="nb-chip-title">{e.title || "Untitled"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,12,16,0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "7vh 16px 16px",
        overflowY: "auto",
      }}
      onClick={() => router.push("/notebook")}
    >
      <div className="oa-card" style={{ width: "100%", maxWidth: 640, padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--line-2)",
          }}
        >
          <div className="overline">{selected.label}</div>
          <button className="oa-iconbtn" onClick={() => router.push("/notebook")} title="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title (e.g. Daily market breakdown)" />
          <div style={{ marginTop: 10 }}>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
              placeholder="Write your page — what you saw, what you did, what to improve…"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
            {saved ? <span style={{ color: "var(--profit)", fontSize: 13, marginRight: "auto" }}>Saved</span> : null}
            <Button variant="ghost" onClick={() => router.push("/notebook")}>
              Close
            </Button>
            <Button variant="accent" icon="check" onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save page"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
