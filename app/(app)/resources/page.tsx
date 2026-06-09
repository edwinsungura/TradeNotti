import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, Icon, EmptyState } from "@/components/ui";
import { createDocument } from "@/lib/actions/documents";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const user = await requireUser();
  const docs = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  const templates = docs.filter((d) => d.kind === "template");
  const documents = docs.filter((d) => d.kind === "doc");

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <div>
          <div className="overline">Library</div>
          <h1 className="oa-page-title">Resources</h1>
          <p className="t-body" style={{ color: "var(--fg-2)", marginTop: 6 }}>
            Your editable document library — trading plans, checklists, reviews. Build a template once and reuse it
            forever.
          </p>
        </div>
        <form action={createDocument}>
          <button type="submit" className="oa-btn oa-btn-accent oa-btn-md">
            <Icon name="plus" size={16} /> New document
          </button>
        </form>
      </div>

      {templates.length ? (
        <>
          <div className="overline" style={{ margin: "8px 0 12px" }}>
            Start from a template
          </div>
          <div className="oa-grid-12" style={{ gap: 12, marginBottom: 24 }}>
            {templates.map((t) => (
              <div key={t.id} style={{ gridColumn: "span 4" }}>
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--gold-wash)",
                        border: "1px solid var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="file-text" size={16} color="var(--gold-deep)" />
                    </div>
                    <b>{t.name}</b>
                  </div>
                  <p className="t-body" style={{ color: "var(--fg-2)", fontSize: 13, minHeight: 38 }}>
                    {t.content && typeof t.content === "object" ? (t.content as { text?: string }).text : ""}
                  </p>
                  <form action={createDocument} style={{ marginTop: 10 }}>
                    <input type="hidden" name="templateId" value={t.id} />
                    <button type="submit" className="oa-btn oa-btn-secondary oa-btn-sm">
                      Use template
                    </button>
                  </form>
                </Card>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="overline" style={{ margin: "8px 0 12px" }}>
        Documents
      </div>
      <Card padding={0}>
        {documents.length ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {documents.map((d) => (
              <Link
                key={d.id}
                href={`/resources/${d.id}`}
                className="oa-acct-item"
                style={{ justifyContent: "flex-start", gap: 12, padding: "14px 18px", textDecoration: "none" }}
              >
                <Icon name="file-text" size={16} color="var(--fg-2)" />
                <span style={{ fontWeight: 600 }}>{d.name}</span>
                <span style={{ marginLeft: "auto", color: "var(--fg-3)", fontSize: 12 }}>
                  {new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="layers"
            title="No documents yet."
            body="Create a document from scratch or start from one of your templates."
          />
        )}
      </Card>
    </div>
  );
}
