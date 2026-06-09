import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, Icon } from "@/components/ui";
import { DocEditor } from "./doc-editor";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const doc = await prisma.document.findFirst({ where: { id, userId: user.id } });
  if (!doc) notFound();

  const text = doc.content && typeof doc.content === "object" ? ((doc.content as { text?: string }).text ?? "") : "";

  return (
    <div className="oa-page">
      <div className="oa-page-header">
        <Link href="/resources" className="overline" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrow-left" size={13} /> Resources
        </Link>
      </div>
      <Card>
        <DocEditor id={doc.id} initialName={doc.name} initialText={text} />
      </Card>
    </div>
  );
}
