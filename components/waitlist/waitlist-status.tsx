"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui";
import { SuccessPanel } from "./success-panel";
import type { JoinResult } from "@/lib/waitlist";

/**
 * Standalone, bookmarkable status view for a single member. Polls their current
 * position every 15s (and on tab focus) so a bookmarked page shows them climbing
 * in real time as referrals land.
 */
export default function WaitlistStatus({ initial }: { initial: JoinResult }) {
  const [result, setResult] = useState(initial);

  useEffect(() => {
    let on = true;
    const refresh = () =>
      fetch(`/api/waitlist/position?ref=${encodeURIComponent(initial.refCode)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (on && d && d.ok) setResult(d as JoinResult);
        })
        .catch(() => {});

    const id = setInterval(refresh, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      on = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initial.refCode]);

  return (
    <div className="wl">
      <header className="wl-nav">
        <BrandLogo size={18} />
      </header>

      <section className="wl-status-main">
        <span className="wl-eyebrow">Your spot in line</span>
        <h1 className="wl-status-pos">You&apos;re #{result.position.toLocaleString("en-US")}</h1>
        <p className="wl-status-sub">
          Your place updates automatically. Share your link to climb higher — every trader who joins
          with it moves you up.
        </p>
        <SuccessPanel result={result} compact />
        <Link className="wl-status-back" href="/">
          ← Back to TradeNotti
        </Link>
      </section>

      <footer className="wl-foot">
        <BrandLogo size={16} />
        <span>© {new Date().getFullYear()} TradeNotti</span>
      </footer>
    </div>
  );
}
