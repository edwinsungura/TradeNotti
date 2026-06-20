import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { statusByRefCode } from "@/lib/waitlist";
import WaitlistStatus from "@/components/waitlist/waitlist-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your waitlist spot · TradeNotti",
  // Private per-member page — keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default async function StatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const status = await statusByRefCode(code);
  if (!status) notFound();
  return <WaitlistStatus initial={status} />;
}
