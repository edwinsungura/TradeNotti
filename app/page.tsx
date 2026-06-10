import Link from "next/link";
import { Icon, BrandLogo } from "@/components/ui";

/* Deterministic hero equity-curve path (matches the prototype). */
function heroEquityPath() {
  const eqPts = 44;
  const eq: number[] = [];
  let val = 0;
  for (let i = 0; i < eqPts; i++) {
    val += 1.1 + Math.sin(i * 0.55) * 1.4 + Math.cos(i * 0.22) * 0.8;
    eq.push(val);
  }
  const eqMin = Math.min(...eq),
    eqMax = Math.max(...eq),
    eqRange = eqMax - eqMin || 1;
  const coords = eq.map((d, i) => [(i / (eqPts - 1)) * 320, 96 - ((d - eqMin) / eqRange) * 84 - 6]);
  return coords.map((c, i) => (i ? "L" : "M") + c[0].toFixed(1) + " " + c[1].toFixed(1)).join(" ");
}

export default function LandingPage() {
  const eqPath = heroEquityPath();

  return (
    <div className="pp-stage" style={{ height: "auto", minHeight: "100vh", overflow: "visible" }}>
      <header className="pp-utilbar">
        <div className="pp-brand">
          <BrandLogo size={18} />
        </div>
        <div className="pp-right">
          <Link href="/login">Sign in</Link>
          <Link href="/signup" className="oa-btn oa-btn-accent oa-btn-md">
            Get started
          </Link>
        </div>
      </header>

      <div className="pp-landing" style={{ overflowY: "visible" }}>
        {/* HERO */}
        <div className="pp-hero">
          <div>
            <h1>
              Trade journaling
              <br />
              &amp; reviewing <em>made simple.</em>
            </h1>
            <p className="pp-hero-sub">
              Stop wasting hours organizing screenshots, notes, and trade reviews manually. TradeNotti automatically
              helps traders capture, organize, and review their trades in one clean workspace — so they can focus on
              improving performance.
            </p>
            <div className="pp-hero-cta">
              <Link href="/signup" className="oa-btn oa-btn-accent oa-btn-md">
                Get started <Icon name="arrow-right" size={16} />
              </Link>
              <Link href="/signup" className="oa-btn oa-btn-ghost oa-btn-md">
                Free trial
              </Link>
            </div>
            <p className="pp-hero-meta">Trusted by serious traders who want clarity, discipline, and growth.</p>
          </div>

          <div className="pp-herofig">
            {/* Main app window */}
            <div className="pp-win">
              <div className="pp-win-bar">
                <span className="pp-win-dot" style={{ background: "#E5605B" }} />
                <span className="pp-win-dot" style={{ background: "#E6B23C" }} />
                <span className="pp-win-dot" style={{ background: "#4FAE6B" }} />
                <span className="pp-win-title">TradeNotti · Dashboard</span>
              </div>
              <div className="pp-win-body">
                <div className="pp-win-row">
                  <div>
                    <div className="overline" style={{ color: "var(--fg-3)" }}>
                      Net P&amp;L · May
                    </div>
                    <div className="pp-win-pnl">+$12,408</div>
                  </div>
                  <div className="pp-win-kpis">
                    <div>
                      <b>62%</b>
                      <span>Win rate</span>
                    </div>
                    <div>
                      <b className="pp-pos">+0.96R</b>
                      <span>Avg R</span>
                    </div>
                  </div>
                </div>
                <svg className="pp-win-chart" viewBox="0 0 320 96" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pp-eq" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--profit)" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="var(--profit)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${eqPath} L320 96 L0 96 Z`} fill="url(#pp-eq)" />
                  <path d={eqPath} fill="none" stroke="var(--profit)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                <div className="pp-win-trades">
                  <div className="pp-win-trow">
                    <span className="pp-win-pair">EUR/USD</span>
                    <span className="pp-up">Long</span>
                    <span className="pp-mono pp-pos">+$245</span>
                    <span className="pp-mono pp-win-r">+2.0R</span>
                  </div>
                  <div className="pp-win-trow">
                    <span className="pp-win-pair">XAU/USD</span>
                    <span className="pp-up">Long</span>
                    <span className="pp-mono pp-pos">+$510</span>
                    <span className="pp-mono pp-win-r">+3.4R</span>
                  </div>
                  <div className="pp-win-trow">
                    <span className="pp-win-pair">GBP/JPY</span>
                    <span className="pp-dn">Short</span>
                    <span className="pp-mono pp-neg">−$120</span>
                    <span className="pp-mono pp-win-r">−1.0R</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating: trade logged */}
            <div className="pp-float pp-float-a">
              <div className="pp-float-ic pp-float-ic-up">
                <Icon name="trending-up" size={16} />
              </div>
              <div>
                <div className="pp-float-t">EUR/USD · Long</div>
                <div className="pp-float-s">
                  <span className="pp-pos pp-mono">+$245</span> · +2.0R logged
                </div>
              </div>
            </div>

            {/* Floating: synced badge */}
            <div className="pp-float pp-float-b">
              <div className="pp-float-ic pp-float-ic-sync">
                <Icon name="refresh-cw" size={15} />
              </div>
              <div>
                <div className="pp-float-t">Synced from MT5</div>
                <div className="pp-float-s">Entry, exit &amp; ROI · auto</div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE SHOWCASE */}
        <section className="pp-show">
          <div className="pp-show-intro">
            <span className="overline" style={{ color: "var(--gold-deep)" }}>
              Inside TradeNotti
            </span>
            <h2>Everything you need to capture, organize, and review.</h2>
            <p>A clean workspace built around the way traders actually work — not another spreadsheet to maintain.</p>
            <div style={{ marginTop: 24 }}>
              <Link href="/signup" className="oa-btn oa-btn-accent oa-btn-md">
                Get started <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>

          {/* 1 — Journal three ways */}
          <div className="pp-show-row">
            <div className="pp-show-copy">
              <span className="pp-show-tag">
                <Icon name="notebook-pen" size={14} /> Journal
              </span>
              <h3>Three ways to journal — all in seconds.</h3>
              <p>
                Log a live <b>trade</b>, a <b>missed trade</b> you should have taken, or a <b>backtest</b> of a setup
                you&apos;re building. Drop chart screenshots, tag the pair, grade the idea, and add notes — without the
                twenty-field forms other tools force on you.
              </p>
              <ul className="pp-show-list">
                <li>
                  <Icon name="check" size={15} /> Before &amp; after screenshots on every trade
                </li>
                <li>
                  <Icon name="check" size={15} /> Tags, grade, and free-form notes
                </li>
                <li>
                  <Icon name="check" size={15} /> Missed trades &amp; backtests, not just fills
                </li>
              </ul>
            </div>
            <div className="pp-show-visual">
              <div className="pp-mini-card">
                <div className="pp-mini-tabs">
                  <span className="on">Trades</span>
                  <span>Missed</span>
                  <span>Backtests</span>
                </div>
                <div className="pp-mini-rows">
                  <div className="pp-mini-trow">
                    <b>EUR/USD</b>
                    <span className="pp-up">Long</span>
                    <span className="pp-mono pp-pos">+$245</span>
                    <span className="pp-mono">+2.0R</span>
                  </div>
                  <div className="pp-mini-trow">
                    <b>GBP/JPY</b>
                    <span className="pp-dn">Short</span>
                    <span className="pp-mono pp-neg">−$120</span>
                    <span className="pp-mono">−1.0R</span>
                  </div>
                  <div className="pp-mini-trow">
                    <b>XAU/USD</b>
                    <span className="pp-up">Long</span>
                    <span className="pp-mono pp-pos">+$510</span>
                    <span className="pp-mono">+3.4R</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2 — Auto-capture / MT5 sync */}
          <div className="pp-show-row reverse">
            <div className="pp-show-copy">
              <span className="pp-show-tag">
                <Icon name="refresh-cw" size={14} /> Auto-capture
              </span>
              <h3>The numbers fill themselves in.</h3>
              <p>
                Connect your account and TradeNotti pulls entry, exit, position size and ROI straight from{" "}
                <b>MT4 / MT5</b> — so you only journal the part that makes you better: the thinking. Your read on the
                market, the grade, the stop in pips, the phase you saw.
              </p>
              <ul className="pp-show-list">
                <li>
                  <Icon name="check" size={15} /> Entry, exit, size &amp; ROI synced automatically
                </li>
                <li>
                  <Icon name="check" size={15} /> You add the judgment — grade, direction, notes
                </li>
                <li>
                  <Icon name="check" size={15} /> No more copy-pasting from your broker
                </li>
              </ul>
            </div>
            <div className="pp-show-visual">
              <div className="pp-mini-card">
                <div className="pp-mini-head">
                  <span className="overline">Outcome</span>
                  <span className="pp-sync">
                    <Icon name="refresh-cw" size={10} /> Synced from MT5
                  </span>
                </div>
                <div className="pp-mini-pnl pp-pos">+$510.00</div>
                <div className="pp-mini-meta">
                  <div>
                    <span>
                      Entry date <i className="pp-src auto">Auto</i>
                    </span>
                    <b className="pp-mono">Jun 2 · 09:42</b>
                  </div>
                  <div>
                    <span>
                      Position size <i className="pp-src auto">Auto</i>
                    </span>
                    <b className="pp-mono">0.75 lots</b>
                  </div>
                  <div>
                    <span>
                      ROI <i className="pp-src auto">Auto</i>
                    </span>
                    <b className="pp-mono pp-pos">+2.04%</b>
                  </div>
                  <div>
                    <span>
                      Trade grade <i className="pp-src man">Journal</i>
                    </span>
                    <b>High probability</b>
                  </div>
                  <div>
                    <span>
                      Phase of market <i className="pp-src man">Journal</i>
                    </span>
                    <b>Markup</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 — Customizable Notebook */}
          <div className="pp-show-row">
            <div className="pp-show-copy">
              <span className="pp-show-tag">
                <Icon name="calendar" size={14} /> Notebook
              </span>
              <h3>A calendar that&apos;s blank until you make it yours.</h3>
              <p>
                The Notebook starts empty. Hit <b>+</b> on any day to write from a blank page or your own template —
                daily breakdowns, weekly reviews, projections, recaps. Build a template once, save it, and reuse it
                forever.
              </p>
              <ul className="pp-show-list">
                <li>
                  <Icon name="check" size={15} /> Fully customizable pages &amp; templates
                </li>
                <li>
                  <Icon name="check" size={15} /> Save any page as a reusable template
                </li>
                <li>
                  <Icon name="check" size={15} /> Green &amp; red days at a glance
                </li>
              </ul>
            </div>
            <div className="pp-show-visual">
              <div className="pp-mini-card">
                <div className="pp-mini-calhead">
                  <b>May 2026</b>
                  <span className="pp-mini-plus">
                    <Icon name="plus" size={12} />
                  </span>
                </div>
                <div className="pp-mini-cal">
                  {Array.from({ length: 28 }, (_, i) => {
                    const v = Math.sin(i * 1.3) + Math.cos(i * 0.7);
                    const c =
                      i > 24 ? "var(--stone-100)" : v > 0.4 ? "var(--profit)" : v < -0.4 ? "var(--loss)" : "var(--stone-200)";
                    return <div key={i} style={{ background: c }} />;
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 4 — Analytics & filtering */}
          <div className="pp-show-row reverse">
            <div className="pp-show-copy">
              <span className="pp-show-tag">
                <Icon name="layout-dashboard" size={14} /> Review
              </span>
              <h3>See what&apos;s working — in plain numbers.</h3>
              <p>
                Win rate, average R, wins vs losses, net P&amp;L and drawdown by period. Then slice your trades with a{" "}
                <b>filter for anything</b> — date, direction, outcome, grade, pair, tags, or R multiple — to find exactly
                where your edge lives.
              </p>
              <ul className="pp-show-list">
                <li>
                  <Icon name="check" size={15} /> Performance by week, month &amp; quarter
                </li>
                <li>
                  <Icon name="check" size={15} /> Stack filters across every property
                </li>
                <li>
                  <Icon name="check" size={15} /> Win / loss breakdown on every view
                </li>
              </ul>
            </div>
            <div className="pp-show-visual">
              <div className="pp-mini-card">
                <div className="pp-mini-stats">
                  <div>
                    <div className="pp-mini-stat">62%</div>
                    <div className="pp-mini-lbl">Win rate</div>
                  </div>
                  <div>
                    <div className="pp-mini-stat pp-pos">+0.96R</div>
                    <div className="pp-mini-lbl">Avg R</div>
                  </div>
                  <div>
                    <div className="pp-mini-stat">
                      <span className="pp-pos">38</span> / <span className="pp-neg">23</span>
                    </div>
                    <div className="pp-mini-lbl">W / L</div>
                  </div>
                </div>
                <div className="pp-mini-chips">
                  <span className="pp-chip">Date is within 7d</span>
                  <span className="pp-chip">Outcome: Win</span>
                  <span className="pp-chip ghost">+ Add filter</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="pp-midcta">
          <div className="pp-midcta-inner">
            <div>
              <h3>Ready to make journaling simple?</h3>
              <p>Capture, organize, and review every trade in one clean workspace.</p>
            </div>
            <Link href="/signup" className="oa-btn oa-btn-accent oa-btn-md">
              Get started <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </section>

        {/* Accountability extras (Refer & earn intentionally omitted) */}
        <div className="pp-features">
          <h2>And the things that keep you accountable.</h2>
          <p className="pp-features-sub">One profile, every account — plus ways to stay on track.</p>
          <div className="pp-features-grid">
            <div className="pp-feat">
              <div className="pp-feat-icon">
                <Icon name="layers" size={20} />
              </div>
              <h3>Multiple accounts</h3>
              <p>Live, prop firm, paper — keep every account under one profile and split your stats or roll them up.</p>
            </div>
            <div className="pp-feat">
              <div className="pp-feat-icon">
                <Icon name="users" size={20} />
              </div>
              <h3>Accountability partners</h3>
              <p>Share an account with a trading partner to keep each other honest — reviews, rules, and results in the open.</p>
            </div>
            <div className="pp-feat">
              <div className="pp-feat-icon">
                <Icon name="sparkles" size={20} />
              </div>
              <h3>Daily AI insight</h3>
              <p>Each day, get one focused, AI-generated insight on your edge, risk, and timing — built from your own trades.</p>
            </div>
          </div>
        </div>

        {/* PRICING (Referred? line intentionally omitted) */}
        <section className="pp-pricing" id="pricing">
          <div className="pp-section-head" style={{ textAlign: "center", margin: "0 auto 48px" }}>
            <span className="overline" style={{ display: "block", marginBottom: 12, color: "var(--gold-deep)" }}>
              Pricing
            </span>
            <h2>One simple plan. Everything included.</h2>
            <p style={{ margin: "14px auto 0" }}>
              No tiers to decode, no per-account fees. Less than a third of what other serious journals charge.
            </p>
          </div>
          <div className="pp-plans">
            <div className="pp-plan-card">
              <div className="pp-plan-name">Free trial</div>
              <div className="pp-plan-price">
                <span className="pp-plan-cur">$</span>0
              </div>
              <div className="pp-plan-sub">14 days · no card required</div>
              <ul className="pp-plan-feats">
                <li>
                  <Icon name="check" size={15} /> Full access to every Pro feature
                </li>
                <li>
                  <Icon name="check" size={15} /> Journal trades, missed trades &amp; backtests
                </li>
                <li>
                  <Icon name="check" size={15} /> No commitment — cancel anytime
                </li>
              </ul>
              <Link href="/signup" className="oa-btn oa-btn-secondary oa-btn-md" style={{ width: "100%", justifyContent: "center" }}>
                Start free trial
              </Link>
            </div>

            <div className="pp-plan-card featured">
              <div className="pp-plan-badge">Best value</div>
              <div className="pp-plan-name">Pro</div>
              <div className="pp-plan-price">
                <span className="pp-plan-cur">$</span>9.99<span className="pp-plan-per">/mo</span>
              </div>
              <div className="pp-plan-sub">Billed monthly · cancel anytime</div>
              <ul className="pp-plan-feats">
                <li>
                  <Icon name="check" size={15} /> Unlimited trades, missed trades &amp; backtests
                </li>
                <li>
                  <Icon name="check" size={15} /> Auto-capture from MT4 / MT5
                </li>
                <li>
                  <Icon name="check" size={15} /> Customizable Notebook &amp; templates
                </li>
                <li>
                  <Icon name="check" size={15} /> Performance analytics &amp; multi-filter review
                </li>
                <li>
                  <Icon name="check" size={15} /> Multiple accounts under one profile
                </li>
                <li>
                  <Icon name="check" size={15} /> Accountability partners
                </li>
              </ul>
              <Link href="/signup" className="oa-btn oa-btn-accent oa-btn-md" style={{ width: "100%", justifyContent: "center" }}>
                Get started <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* DIRECT CTA */}
        <section className="pp-cta-section">
          <h2>
            Capture today&apos;s trades.
            <br />
            <span style={{ color: "var(--gold-deep)" }}>Review with clarity.</span>
          </h2>
          <p>One clean workspace for journaling, reviewing, and improving — start free.</p>
          <Link href="/signup" className="oa-btn oa-btn-accent oa-btn-md">
            Get started <Icon name="arrow-right" size={16} />
          </Link>
        </section>

        <div className="pp-foot">
          <span>© 2026 TradeNotti</span>
          <span>Trading journaling &amp; reviewing made simple.</span>
        </div>
      </div>
    </div>
  );
}
