import type { Metadata } from "next";
import WaitlistLanding from "@/components/waitlist/waitlist-landing";
import { launchDateISO, totalInLine, WAITLIST_BASE_COUNT } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TradeNotti — Your voice trade journal workspace · Join the waitlist",
  description:
    "TradeNotti is your voice trade journal workspace: speak your trade review out loud and it transcribes it into a clean, written note — in seconds. Join the waitlist to lock 50% off the yearly plan.",
  openGraph: {
    title: "TradeNotti — Your voice trade journal workspace",
    description:
      "Join the waitlist. Speak your review and TradeNotti transcribes it into a clean, written note — in seconds.",
    siteName: "TradeNotti",
    type: "website",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; source?: string }>;
}) {
  const sp = await searchParams;

  // SSR the live count so the hero never flashes a placeholder.
  let initialTotal = WAITLIST_BASE_COUNT;
  try {
    initialTotal = await totalInLine();
  } catch {
    // DB not reachable at render time — client will refetch /api/waitlist/stats.
  }

  return (
    <WaitlistLanding
      initialTotal={initialTotal}
      launchDate={launchDateISO()}
      inviteRef={sp.ref ?? null}
      source={sp.source ?? null}
    />
  );
}
