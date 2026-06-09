import { requireUser } from "@/lib/session";
import { Card, EmptyState, Icon } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  await requireUser();
  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Accountability</div>
          <h1 className="oa-page-title">Partners</h1>
          <p className="t-body" style={{ color: "var(--fg-2)", marginTop: 6 }}>
            Share a read-only view of an account with a trading partner to keep each other honest — reviews, rules, and
            results in the open.
          </p>
        </div>
      </div>

      <Card>
        <EmptyState
          icon="users"
          title="No accountability partners yet."
          body="Invite a partner to share a read-only view of your trading. They'll see your reviews, rules, and results — and you'll see theirs."
          action={
            <span className="oa-btn oa-btn-secondary oa-btn-md" style={{ opacity: 0.7, cursor: "default" }}>
              <Icon name="mail" size={16} /> Invite a partner (coming soon)
            </span>
          }
        />
      </Card>
    </div>
  );
}
