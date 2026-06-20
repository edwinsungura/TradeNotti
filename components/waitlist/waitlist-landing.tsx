"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, BrandLogo } from "@/components/ui";

type JoinResult = {
  email: string;
  refCode: string;
  position: number;
  referrals: number;
  total: number;
  alreadyJoined: boolean;
};

type Props = {
  initialTotal: number;
  launchDate: string;
  inviteRef: string | null;
  source: string | null;
};

export default function WaitlistLanding({ initialTotal, launchDate, inviteRef, source }: Props) {
  const [total, setTotal] = useState(initialTotal);
  const [status, setStatus] = useState<"idle" | "loading" | "joined" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JoinResult | null>(null);

  // Keep the count live: refresh on mount, every 15s, and whenever the tab
  // regains focus — so the "traders in line" number is real-time.
  useEffect(() => {
    let on = true;
    const refresh = () =>
      fetch("/api/waitlist/stats")
        .then((r) => r.json())
        .then((d) => {
          if (on && typeof d.total === "number") setTotal(d.total);
        })
        .catch(() => {});

    refresh();
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
  }, []);

  const join = useCallback(
    async (email: string) => {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch("/api/waitlist/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, ref: inviteRef, source }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }
        setResult(data as JoinResult);
        setTotal(data.total ?? total);
        setStatus("joined");
        // Surface the success state at the top of the viewport.
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError("Network error. Please try again.");
        setStatus("error");
      }
    },
    [inviteRef, source, total],
  );

  const joined = status === "joined" && result;

  return (
    <div className="wl">
      <header className="wl-nav">
        <BrandLogo size={18} />
      </header>

      {/* ===== HERO ===== */}
      <section className="wl-hero">
        <div className="wl-hero-copy">
          <h1>
            Voice-journal your trades.
            <br />
            <span className="wl-accent">Join the waitlist.</span>
          </h1>
          <p className="wl-lead">
            Speak your review, drop in your charts, and TradeNotti transcribes, tags, and files
            every trade — in seconds.
          </p>

          {joined ? (
            <SuccessPanel result={result!} />
          ) : (
            <>
              <div className="wl-perk">
                <Icon name="badge-percent" size={16} />
                <span>
                  Join now to lock <b>50% off the yearly plan</b> — waitlist only.
                </span>
              </div>
              <JoinForm onJoin={join} status={status} error={error} />
              <p className="wl-noteline">
                <Icon name="check" size={14} /> No card required
              </p>
            </>
          )}
        </div>

        <div className="wl-hero-visual">
          <div className="wl-voice">
            <div className="wl-voice-bar">
              <span className="wl-dot" style={{ background: "#E5605B" }} />
              <span className="wl-dot" style={{ background: "#E6B23C" }} />
              <span className="wl-dot" style={{ background: "#4FAE6B" }} />
              <span className="wl-voice-title">TradeNotti · Voice journal</span>
            </div>
            <div className="wl-voice-body">
              <div className="wl-voice-rec">
                <span className="wl-voice-mic">
                  <Icon name="mic" size={16} />
                </span>
                <span className="wl-voice-wave">
                  {Array.from({ length: 30 }, (_, i) => {
                    const h = 4 + Math.abs(Math.sin(i * 0.9) * 16 + Math.cos(i * 0.5) * 6);
                    return (
                      <span
                        key={i}
                        style={{
                          height: `${Math.min(24, h)}px`,
                          background: i < 18 ? "var(--gold)" : "var(--stone-300)",
                        }}
                      />
                    );
                  })}
                </span>
                <span className="wl-voice-time">0:14</span>
              </div>
              <div className="wl-voice-trans">
                <div className="wl-overline">AI transcribing…</div>
                <p>
                  &ldquo;Took the EUR/USD long off the London open — clean break, waited for the
                  retest like the plan said.{" "}
                  <span className="wl-hl">Felt calm, sized right, R was two.</span> Closed at target,
                  no FOMO this time.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="wl-testimonial">
            <span className="wl-avatar">AM</span>
            <div>
              <div className="wl-testimonial-name">Amrisali Mkwizu</div>
              <div className="wl-testimonial-role">Once ranked #1 FTMO trader</div>
              <p className="wl-testimonial-quote">
                &ldquo;This voice journal feature is a game changer.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="wl-proof">
        <div className="wl-proof-avatars">
          <span style={{ background: "#0B0C10" }}>AM</span>
          <span style={{ background: "#3D31CE" }}>JC</span>
          <span style={{ background: "#15966A" }}>RK</span>
          <span className="wl-proof-more">+</span>
        </div>
        <span className="wl-proof-count">
          <b>{total.toLocaleString("en-US")}</b> traders are already in line
        </span>
      </section>

      {/* ===== HOW THE LINE WORKS ===== */}
      <section className="wl-line">
        <span className="wl-eyebrow">Your place in line isn&apos;t fixed</span>
        <h2>The earlier you are, the sooner you&apos;re in.</h2>
        <p className="wl-line-sub">
          We onboard in cohorts — not all at once. Claim a spot, then climb the line by referring
          traders who get it.
        </p>
        <div className="wl-steps">
          <Step
            n="01"
            icon="mail"
            title="Claim your spot"
            body="Drop your email. No card, no commitment — just your place in line."
          />
          <Step
            n="02"
            icon="hash"
            title="Hold your place"
            body="You're in line the moment you join — and the earlier you claim, the earlier your cohort."
          />
          <Step
            n="03"
            icon="link"
            title="Refer to climb"
            body="Every friend who joins moves you up the line — and into an earlier cohort."
          />
        </div>
      </section>

      {/* ===== COUNTDOWN ===== */}
      <section className="wl-countdown">
        <span className="wl-countdown-label">Waitlist cohort opens in</span>
        <Countdown target={launchDate} />
      </section>

      {/* ===== SNEAK PEEK ===== */}
      <section className="wl-peek">
        <span className="wl-eyebrow">A sneak peek</span>
        <h2>Here&apos;s what you&apos;re getting in.</h2>
        <p className="wl-line-sub">
          A first look at the workspace — the full experience unlocks when the waitlist opens.
        </p>

        <div className="wl-peek-grid">
          {/* Voice journal — flagship */}
          <div className="wl-peek-card">
            <div className="wl-peek-head">
              <span className="wl-peek-ic">
                <Icon name="mic" size={18} />
              </span>
              <span className="wl-tag">Flagship</span>
            </div>
            <h3>Voice journal</h3>
            <p>
              Speak your review out loud and TradeNotti transcribes it into a clean, structured
              trade note — in seconds.
            </p>
            <div className="wl-peek-foot">
              <div className="wl-voice-rec compact">
                <span className="wl-voice-mic">
                  <Icon name="mic" size={14} />
                </span>
                <span className="wl-voice-wave">
                  {Array.from({ length: 22 }, (_, i) => (
                    <span
                      key={i}
                      style={{
                        height: `${4 + Math.abs(Math.sin(i) * 14)}px`,
                        background: i < 13 ? "var(--gold)" : "var(--stone-300)",
                      }}
                    />
                  ))}
                </span>
                <span className="wl-voice-time">0:14</span>
              </div>
            </div>
          </div>

          {/* Every-broker sync */}
          <div className="wl-peek-card">
            <div className="wl-peek-head">
              <span className="wl-peek-ic">
                <Icon name="refresh-cw" size={18} />
              </span>
              <span className="wl-tag">Preview</span>
            </div>
            <h3>Every-broker sync</h3>
            <p>Entry, exit, size &amp; ROI pull in automatically — you just add the thinking.</p>
            <div className="wl-peek-foot">
              <div className="wl-sync-card">
                <span className="wl-sync-pnl">+$510.00</span>
                <span className="wl-sync-badge">
                  <Icon name="refresh-cw" size={11} /> Synced
                </span>
                <div className="wl-sync-meta">
                  <span>
                    ROI <b className="wl-pos">+2.04%</b>
                  </span>
                  <span>
                    Size <b>0.75 lots</b>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notebook */}
          <div className="wl-peek-card">
            <div className="wl-peek-head">
              <span className="wl-peek-ic">
                <Icon name="calendar" size={18} />
              </span>
            </div>
            <h3>Notebook</h3>
            <p>A calendar that&apos;s blank until you make it yours.</p>
            <div className="wl-peek-foot">
              <div className="wl-cal">
                {Array.from({ length: 14 }, (_, i) => {
                  const v = Math.sin(i * 1.3) + Math.cos(i * 0.7);
                  const c =
                    i > 12
                      ? "var(--stone-100)"
                      : v > 0.4
                        ? "var(--profit)"
                        : v < -0.4
                          ? "var(--loss)"
                          : "var(--stone-200)";
                  return <span key={i} style={{ background: c }} />;
                })}
              </div>
            </div>
          </div>

          {/* Review */}
          <div className="wl-peek-card">
            <div className="wl-peek-head">
              <span className="wl-peek-ic">
                <Icon name="trending-up" size={18} />
              </span>
            </div>
            <h3>Review</h3>
            <p>See what&apos;s working — win rate, R, P&amp;L, filtered any way.</p>
            <div className="wl-peek-foot">
              <div className="wl-review-stats">
                <div>
                  <span className="wl-review-stat">62%</span>
                  <span className="wl-review-lbl">Win rate</span>
                </div>
                <div>
                  <span className="wl-review-stat wl-pos">+0.96R</span>
                  <span className="wl-review-lbl">Avg R</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACCOUNTABILITY ===== */}
      <section className="wl-accountable">
        <span className="wl-eyebrow light">Stay accountable</span>
        <h2>The things that keep you on track.</h2>
        <p className="wl-accountable-sub">
          One profile, every account — plus the tools to stay honest with yourself and others.
        </p>
        <div className="wl-acc-grid">
          <AccItem
            icon="layers"
            title="Multiple accounts"
            body="Live, prop firm, paper — keep every account under one profile and split your stats or roll them up."
          />
          <AccItem
            icon="users"
            title="Accountability partners"
            body="Share an account with a trading partner to keep each other honest — reviews, rules, and results in the open."
          />
          <AccItem
            icon="sparkles"
            title="Daily AI insight"
            body="Each day, get one focused, AI-generated insight on your edge, risk, and timing — built from your own trades."
          />
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="wl-final">
        <span className="wl-final-eyebrow">
          <span className="wl-final-rule" /> Get 50% off on a yearly plan{" "}
          <span className="wl-final-rule" />
        </span>
        <h2>Claim your waitlist spot.</h2>
        <p>Be first in line, lock your waitlist rate, and climb by inviting traders who get it.</p>
        {joined ? (
          <SuccessPanel result={result!} compact />
        ) : (
          <>
            <JoinForm onJoin={join} status={status} error={error} />
            <p className="wl-final-note">No card required · cancel anytime · works with every broker</p>
          </>
        )}
      </section>

      <footer className="wl-foot">
        <BrandLogo size={16} />
        <span>© {new Date().getFullYear()} TradeNotti</span>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function JoinForm({
  onJoin,
  status,
  error,
}: {
  onJoin: (email: string) => void;
  status: "idle" | "loading" | "joined" | "error";
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const company = useRef<HTMLInputElement>(null); // honeypot

  return (
    <form
      className="wl-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (status === "loading") return;
        onJoin(email);
      }}
    >
      <div className="wl-form-row">
        <input
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="wl-input"
          aria-label="Email address"
        />
        {/* Honeypot — visually hidden, ignored by humans, filled by bots. */}
        <input
          ref={company}
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="wl-honeypot"
        />
        <button type="submit" className="wl-submit" disabled={status === "loading"}>
          {status === "loading" ? "Claiming…" : "Claim my spot"}
          {status !== "loading" && <Icon name="arrow-right" size={16} />}
        </button>
      </div>
      {error && <p className="wl-error">{error}</p>}
    </form>
  );
}

function SuccessPanel({ result, compact = false }: { result: JoinResult; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/?ref=${result.refCode}`;
    return `${window.location.origin}/?ref=${result.refCode}`;
  }, [result.refCode]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — link is still selectable below */
    }
  };

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

      <div className="wl-share">
        <span className="wl-share-label">Share to climb the line</span>
        <div className="wl-share-row">
          <input className="wl-input" value={shareUrl} readOnly onFocus={(e) => e.target.select()} />
          <button type="button" className="wl-submit" onClick={copy}>
            {copied ? "Copied!" : "Copy link"}
            {!copied && <Icon name="copy" size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ n, icon, title, body }: { n: string; icon: string; title: string; body: string }) {
  return (
    <div className="wl-step">
      <span className="wl-step-ic">
        <Icon name={icon} size={18} />
      </span>
      <span className="wl-step-n">{n}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function AccItem({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="wl-acc">
      <span className="wl-acc-ic">
        <Icon name={icon} size={20} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function Countdown({ target }: { target: string }) {
  const targetMs = useMemo(() => Date.parse(target), [target]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Defer the first read off the effect body to avoid a synchronous setState
    // (and the SSR/client hydration mismatch — server renders zeros).
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  // Avoid a hydration mismatch: render zeros until the client clock starts.
  const remaining = now == null ? 0 : Math.max(0, targetMs - now);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="wl-clock">
      <Unit value={String(days)} label="Days" />
      <Unit value={pad(hours)} label="Hours" />
      <Unit value={pad(mins)} label="Mins" />
      <Unit value={pad(secs)} label="Secs" accent />
    </div>
  );
}

function Unit({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="wl-unit">
      <span className={`wl-unit-num${accent ? " accent" : ""}`}>{value}</span>
      <span className="wl-unit-lbl">{label}</span>
    </div>
  );
}
