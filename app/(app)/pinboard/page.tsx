import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PinboardPage() {
  const user = await requireUser();
  const screenshots = await prisma.screenshot.findMany({
    where: { trade: { userId: user.id } },
    orderBy: { id: "desc" },
    take: 60,
    include: { trade: { select: { pair: true } } },
  });

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Library</div>
          <h1 className="oa-page-title">Pinboard</h1>
          <p className="t-body" style={{ color: "var(--fg-2)", marginTop: 6 }}>
            Every chart screenshot you attach to a trade, in one visual board.
          </p>
        </div>
      </div>

      {screenshots.length ? (
        <div className="oa-grid-12" style={{ gap: 12 }}>
          {screenshots.map((s) => (
            <div key={s.id} style={{ gridColumn: "span 3" }}>
              <Card padding={0} style={{ overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={s.trade?.pair ?? "chart"} style={{ width: "100%", display: "block" }} />
                <div style={{ padding: "8px 12px", fontSize: 12, color: "var(--fg-2)" }}>{s.trade?.pair}</div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="images"
            title="No screenshots yet."
            body="Attach before & after chart screenshots to your trades and they'll collect here."
          />
        </Card>
      )}
    </div>
  );
}
