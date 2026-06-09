"use client";

import { useState, useTransition } from "react";
import { Icon, Button, Input, Select } from "@/components/ui";
import { addRule, toggleRule, deleteRule } from "@/lib/actions/rules";

type RuleVM = { id: string; text: string; category: string; active: boolean };

const CATEGORIES = ["Risk", "Entry", "Timing", "Management", "Volume", "News", "Psychology"];

export function RulesManager({ rules }: { rules: RuleVM[] }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Risk");
  const [pending, startTransition] = useTransition();

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (text.trim().length < 3) return;
    const fd = new FormData();
    fd.set("text", text);
    fd.set("category", category);
    startTransition(async () => {
      await addRule(fd);
      setText("");
    });
  }

  return (
    <div>
      <form onSubmit={onAdd} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <label className="oa-field">
            <span className="oa-field-label">New rule</span>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Risk per trade ≤ 1% of account"
            />
          </label>
        </div>
        <div style={{ width: 170 }}>
          <label className="oa-field">
            <span className="oa-field-label">Category</span>
            <Select value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </label>
        </div>
        <Button type="submit" variant="accent" icon="plus" disabled={pending}>
          Add rule
        </Button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rules.length === 0 ? (
          <p className="t-body" style={{ color: "var(--fg-2)" }}>
            No rules yet — add the first rule you trade by above.
          </p>
        ) : null}
        {rules.map((r) => (
          <div
            key={r.id}
            className="oa-rule-row"
            style={{ opacity: r.active ? 1 : 0.5, display: "flex", alignItems: "center", gap: 12 }}
          >
            <button
              className="oa-rule-check"
              title={r.active ? "Active — click to pause" : "Paused — click to activate"}
              onClick={() => startTransition(() => toggleRule(r.id))}
              style={{
                cursor: "pointer",
                background: r.active ? "var(--profit)" : "transparent",
                border: r.active ? "none" : "1.5px solid var(--stone-300)",
              }}
            >
              {r.active ? <Icon name="check" size={12} color="white" /> : null}
            </button>
            <span className="oa-rule-text" style={{ flex: 1 }}>
              {r.text}
            </span>
            <span className="oa-rule-cat">{r.category}</span>
            <button
              className="oa-iconbtn"
              title="Delete rule"
              onClick={() => startTransition(() => deleteRule(r.id))}
            >
              <Icon name="trash-2" size={15} color="var(--fg-3)" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
