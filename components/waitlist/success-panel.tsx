"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import type { JoinResult } from "@/lib/waitlist";

/** Tiny clipboard helper with a transient "Copied!" state. */
function useCopier() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the field is still selectable */
    }
  };
  return { copied, copy };
}

/**
 * The "you're in line" card: position, referral count, and the links that make
 * the line work. `showStatus` adds the device-saved note and the private status
 * link (used on the landing page after joining); the status page itself already
 * is that link, so it renders the card without them.
 */
export function SuccessPanel({
  result,
  compact = false,
  showStatus = false,
}: {
  result: JoinResult;
  compact?: boolean;
  showStatus?: boolean;
}) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const shareUrl = useMemo(() => `${origin}/?ref=${result.refCode}`, [origin, result.refCode]);
  const statusUrl = useMemo(() => `${origin}/status/${result.refCode}`, [origin, result.refCode]);

  const share = useCopier();
  const status = useCopier();

  return (
    <div className={`wl-success${compact ? " compact" : ""}`}>
      <div className="wl-success-head">
        <span className="wl-success-ic">
          <Icon name="check" size={18} />
        </span>
        <div>
          <div className="wl-success-title">
            {result.alreadyJoined ? "You're already in line." : "You're in line!"}
          </div>
          <div className="wl-success-sub">{result.email}</div>
        </div>
      </div>

      <div className="wl-success-stats">
        <div>
          <div className="wl-success-num">#{result.position.toLocaleString("en-US")}</div>
          <div className="wl-success-lbl">Your position</div>
        </div>
        <div>
          <div className="wl-success-num">{result.referrals}</div>
          <div className="wl-success-lbl">Referrals</div>
        </div>
      </div>

      {showStatus && (
        <p className="wl-success-note">
          <Icon name="check" size={14} /> Saved on this device — reopen this page anytime to jump
          back to your spot.
        </p>
      )}

      <div className="wl-share">
        <span className="wl-share-label">Share to climb the line</span>
        <div className="wl-share-row">
          <input className="wl-input" value={shareUrl} readOnly onFocus={(e) => e.target.select()} />
          <button type="button" className="wl-submit" onClick={() => share.copy(shareUrl)}>
            {share.copied ? "Copied!" : "Copy link"}
            {!share.copied && <Icon name="copy" size={15} />}
          </button>
        </div>
        <p className="wl-share-hint">Every trader who joins with your link moves you up the line.</p>
      </div>

      {showStatus && (
        <div className="wl-share">
          <span className="wl-share-label">Your private status link</span>
          <div className="wl-share-row">
            <input className="wl-input" value={statusUrl} readOnly onFocus={(e) => e.target.select()} />
            <button type="button" className="wl-submit" onClick={() => status.copy(statusUrl)}>
              {status.copied ? "Copied!" : "Copy link"}
              {!status.copied && <Icon name="copy" size={15} />}
            </button>
          </div>
          <p className="wl-share-hint">Bookmark it to check your place from any device.</p>
        </div>
      )}
    </div>
  );
}
