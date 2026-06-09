import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { RulesManager } from "./rules-manager";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const user = await requireUser();
  const rules = await prisma.rule.findMany({
    where: { userId: user.id },
    orderBy: [{ active: "desc" }, { order: "asc" }],
  });
  const active = rules.filter((r) => r.active).length;

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Your rulebook</div>
          <h1 className="oa-page-title">Trading rules</h1>
          <p className="t-body" style={{ color: "var(--fg-2)", marginTop: 6 }}>
            The rules you trade by. {active} active — TradeNotti keeps them front and centre and scores your adherence.
          </p>
        </div>
      </div>

      <Card style={{ marginTop: 4 }}>
        <RulesManager
          rules={rules.map((r) => ({ id: r.id, text: r.text, category: r.category, active: r.active }))}
        />
      </Card>
    </div>
  );
}
