import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, Icon, TagChip } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { relativeLabel } from "@/lib/view";
import { DeleteTradeButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const trade = await prisma.trade.findFirst({
    where: { id, userId: user.id },
    include: { tags: { include: { tag: true } }, screenshots: true, account: true },
  });
  if (!trade) notFound();

  const dir = trade.direction === "LONG" ? "Long" : "Short";
  const rows: [string, string][] = [
    ["Account", trade.account?.name ?? "—"],
    ["Direction", dir],
    ["Status", trade.status === "OPEN" ? "Open" : "Closed"],
    ["Entry", trade.entryPrice != null ? String(trade.entryPrice) : "—"],
    ["Stop loss", trade.sl != null ? String(trade.sl) : "—"],
    ["Take profit", trade.tp != null ? String(trade.tp) : "—"],
    ["R multiple", trade.rr != null ? `${trade.rr > 0 ? "+" : ""}${trade.rr}R` : "—"],
    ["Grade", trade.grade ?? "—"],
    ["Logged", relativeLabel(trade.entryAt ?? trade.createdAt)],
  ];

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <Link href="/journal" className="overline" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="arrow-left" size={13} /> Journal
          </Link>
          <h1 className="oa-page-title" style={{ marginTop: 6 }}>
            {trade.pair}
          </h1>
        </div>
        <DeleteTradeButton id={trade.id} />
      </div>

      <div className="oa-grid-12" style={{ gap: 16 }}>
        <Card style={{ gridColumn: "span 5" }}>
          <div className="overline">Outcome</div>
          <div
            className="oa-kpi-value"
            style={{ marginTop: 8, color: (trade.pnl ?? 0) >= 0 ? "var(--profit)" : "var(--loss)" }}
          >
            {trade.pnl != null ? formatMoney(trade.pnl) : "Open"}
          </div>
          <div style={{ marginTop: 16 }}>
            {rows.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--line-2)",
                }}
              >
                <span style={{ color: "var(--fg-2)", fontSize: 13 }}>{k}</span>
                <b style={{ fontSize: 13 }}>{v}</b>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ gridColumn: "span 7" }}>
          <div className="overline">Setup &amp; notes</div>
          <p className="t-body" style={{ marginTop: 10, color: "var(--fg-1)" }}>
            {trade.setup || "No notes added for this trade."}
          </p>
          {trade.tags.length ? (
            <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {trade.tags.map((t) => (
                <TagChip key={t.tagId} tone="neutral">
                  {t.tag.name}
                </TagChip>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 20 }}>
            <div className="overline" style={{ marginBottom: 8 }}>
              Screenshots
            </div>
            {trade.screenshots.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {trade.screenshots.map((s) => (
                  <img key={s.id} src={s.url} alt={s.kind} style={{ width: "100%", borderRadius: 10, border: "1px solid var(--line-2)" }} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  border: "1.5px dashed var(--line-1)",
                  borderRadius: 10,
                  padding: 24,
                  textAlign: "center",
                  color: "var(--fg-3)",
                  fontSize: 13,
                }}
              >
                Before &amp; after chart screenshots will appear here.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
