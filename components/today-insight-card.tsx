"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Icon } from "@/components/ui";
import { InsightGenerate } from "@/components/insight-generate";

export function TodayInsightCard({
  hasInsight,
  tag,
  content,
}: {
  hasInsight: boolean;
  tag: string | null;
  content: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <Card style={{ gridColumn: "span 8", background: "var(--gold-wash)", borderColor: "var(--gold)" }}>
      <div className="overline" style={{ color: "var(--stone-700)" }}>
        Daily insight{tag ? ` · ${tag}` : ""}
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
          {content}
        </p>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        {hasInsight ? (
          <>
            <Link href="/analytics" className="oa-btn oa-btn-primary oa-btn-md">
              See report <Icon name="arrow-right" size={16} />
            </Link>
            <button className="oa-btn oa-btn-ghost oa-btn-md" onClick={() => setDismissed(true)}>
              Dismiss
            </button>
          </>
        ) : (
          <InsightGenerate />
        )}
      </div>
    </Card>
  );
}
