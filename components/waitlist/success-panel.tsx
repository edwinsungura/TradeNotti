"use client";

import { Icon } from "@/components/ui";
import type { JoinResult } from "@/lib/waitlist";

/**
 * Post-signup confirmation. Intentionally minimal — no position number or
 * referral mechanics; just a clear "you're on the list" acknowledgement.
 */
export function SuccessPanel({ result, compact = false }: { result: JoinResult; compact?: boolean }) {
  return (
    <div className={`wl-success${compact ? " compact" : ""}`}>
      <div className="wl-success-head">
        <span className="wl-success-ic">
          <Icon name="check" size={18} />
        </span>
        <div>
          <div className="wl-success-title">
            {result.alreadyJoined ? "You're already on the list." : "You're on the list!"}
          </div>
          <div className="wl-success-sub">{result.email}</div>
        </div>
      </div>
      <p className="wl-success-note">
        <Icon name="check" size={14} /> We&apos;ll email you the moment your invite is ready.
      </p>
    </div>
  );
}
