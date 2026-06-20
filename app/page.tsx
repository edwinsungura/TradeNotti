import type { Metadata } from "next";
import WaitlistLanding from "@/components/waitlist/waitlist-landing";
import { launchDateISO, totalInLine, WAITLIST_BASE_COUNT } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TradeNotti — Voice-journal your trades · Join the waitlist",
  description:
    "Speak your review, drop in your charts, and TradeNotti transcribes, tags, and files every trade — in seconds. Join the waitlist to lock 50% off the yearly plan.",
  openGraph: {
    title: "TradeNotti — Voice-journal your trades",
    description:
      "Join the waitlist. Speak your review and TradeNotti transcribes it into a clean, structured trade note — in seconds.",
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
