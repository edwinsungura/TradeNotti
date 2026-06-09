"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon, Button, BrandLogo } from "@/components/ui";
import { completeOnboarding } from "@/lib/actions/onboarding";

const ONB_RULES = [
  { id: 1, text: "Risk per trade ≤ 1% of account", category: "Risk", default: true },
  { id: 2, text: "Must have entry confirmation candle", category: "Entry", default: true },
  { id: 3, text: "Never add to a losing position", category: "Management", default: true },
  { id: 4, text: "No trades in first 5 min of London open", category: "Timing", default: false },
  { id: 5, text: "Max 3 trades per session", category: "Volume", default: false },
  { id: 6, text: "No trading 30 min before red-folder news", category: "News", default: true },
];

const FOCI = [
  { id: "forex", icon: "circle-dollar-sign", title: "Forex", sub: "Majors, minors, exotics" },
  { id: "crypto", icon: "bitcoin", title: "Crypto", sub: "BTC, ETH, altcoins" },
  { id: "stocks", icon: "trending-up", title: "Stocks", sub: "Equities + indices" },
  { id: "mixed", icon: "layers", title: "Mixed", sub: "I trade everything" },
];

const ALL_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "GBP/JPY", "EUR/GBP", "NZD/USD", "USD/CAD",
  "USD/CHF", "XAU/USD", "XAG/USD", "BTC/USD", "ETH/USD", "SPX500", "NAS100",
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState("forex");
  const [pairs, setPairs] = useState<string[]>(["EUR/USD", "GBP/JPY", "XAU/USD"]);
  const [rules, setRules] = useState<Set<number>>(new Set(ONB_RULES.filter((r) => r.default).map((r) => r.id)));
  const [pending, startTransition] = useTransition();

  const togglePair = (p: string) =>
    setPairs((arr) => (arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]));
  const toggleRule = (id: number) =>
    setRules((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  function finish() {
    startTransition(async () => {
      await completeOnboarding({
        focus,
        pairs,
        rules: ONB_RULES.filter((r) => rules.has(r.id)).map((r) => ({ text: r.text, category: r.category })),
      });
      router.push("/today");
      router.refresh();
    });
  }

  const next = () => (step < 2 ? setStep(step + 1) : finish());

  return (
    <div className="pp-stage" style={{ height: "auto", minHeight: "100vh", overflow: "visible" }}>
      <header className="pp-utilbar">
        <Link href="/" className="pp-brand" style={{ textDecoration: "none" }}>
          <BrandLogo size={18} />
        </Link>
        <div className="pp-right">
          <button onClick={finish} style={{ color: "var(--fg-2)", fontSize: 13, background: "none", border: 0, cursor: "pointer" }}>
            Skip onboarding
          </button>
        </div>
      </header>

      <div className="pp-onb">
        <div className="pp-onb-card">
          <div className="pp-onb-step-bar">
            {[0, 1, 2].map((i) => (
              <div key={i} className={i < step ? "done" : i === step ? "now" : ""} />
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="pp-onb-eyebrow">Step 1 of 3</div>
              <h2>What do you trade?</h2>
              <p className="pp-onb-sub">We&apos;ll pre-load the right pairs and tune the analytics to your market.</p>
              <div className="pp-onb-choices">
                {FOCI.map((c) => (
                  <button key={c.id} className={`pp-onb-choice ${focus === c.id ? "on" : ""}`} onClick={() => setFocus(c.id)}>
                    <span className="pp-onb-c-icon">
                      <Icon name={c.icon} size={18} />
                    </span>
                    <span className="pp-onb-c-title">{c.title}</span>
                    <span className="pp-onb-c-sub">{c.sub}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="pp-onb-eyebrow">Step 2 of 3</div>
              <h2>Which pairs do you trade most?</h2>
              <p className="pp-onb-sub">Pick your watchlist. You can change this anytime in Settings.</p>
              <div className="pp-onb-pills">
                {ALL_PAIRS.map((p) => (
                  <button key={p} className={`pp-onb-pill ${pairs.includes(p) ? "on" : ""}`} onClick={() => togglePair(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <p className="t-caption" style={{ marginTop: 14, color: "var(--fg-2)" }}>
                {pairs.length} selected · we recommend 3–8 to start
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="pp-onb-eyebrow">Step 3 of 3 · Invest in your discipline</div>
              <h2>Pick your starter rules.</h2>
              <p className="pp-onb-sub">Your rulebook is what makes TradeNotti more than a journal. You can add your own anytime.</p>
              <div className="pp-onb-rules">
                {ONB_RULES.map((r) => (
                  <div key={r.id} className={`pp-onb-rule ${rules.has(r.id) ? "on" : ""}`} onClick={() => toggleRule(r.id)}>
                    <span className="pp-onb-rule-check">{rules.has(r.id) ? <Icon name="check" size={12} color="var(--ink)" /> : null}</span>
                    <span className="pp-onb-rule-text">{r.text}</span>
                    <span className="pp-onb-rule-cat">{r.category}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="pp-onb-actions">
            <Button variant="ghost" onClick={() => (step === 0 ? router.push("/") : setStep(step - 1))}>
              ← {step === 0 ? "Back" : "Previous"}
            </Button>
            <Button variant="accent" iconRight="arrow-right" onClick={next} disabled={pending}>
              {step === 2 ? (pending ? "Finishing…" : "Enter TradeNotti") : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
