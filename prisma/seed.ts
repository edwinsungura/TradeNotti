import { PrismaClient, AssetClass, Direction, TradeStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "edwin@tradenotti.app";
const DEMO_PASSWORD = "tradenotti";

function daysAgo(n: number, hour = 9, min = 30) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d;
}

const num = (s: string) => parseFloat(s.replace(/,/g, ""));

async function main() {
  // Reset demo user (idempotent seed)
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) await prisma.user.delete({ where: { id: existing.id } });

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Edwin",
      hashedPassword,
      tradingFocus: "forex",
      watchlist: ["EUR/USD", "GBP/JPY", "XAU/USD", "BTC/USD"],
      onboardedAt: new Date(),
    },
  });

  const live = await prisma.account.create({
    data: { userId: user.id, name: "Live · FTMO 100k", broker: "MetaTrader 5", currency: "USD", kind: "live", balance: "$104,210" },
  });
  await prisma.account.create({
    data: { userId: user.id, name: "Demo · Practice", broker: "TradingView", currency: "USD", kind: "demo", balance: "$50,000" },
  });
  await prisma.account.create({
    data: { userId: user.id, name: "Personal · IBKR", broker: "Interactive Brokers", currency: "GBP", kind: "live", balance: "£8,420" },
  });

  type Seed = {
    pair: string; dir: Direction; asset: AssetClass; entry: string; sl: string; tp: string;
    pnl: number | null; rr: number | null; status: TradeStatus; grade: string; tags: string[];
    setup: string; day: number; hour: number; min: number;
  };
  const trades: Seed[] = [
    { pair: "EUR/USD", dir: "LONG", asset: "FOREX", entry: "1.08412", sl: "1.08260", tp: "1.08720", pnl: 245, rr: 2.0, status: "CLOSED", grade: "High probability", tags: ["Confirmation", "London open"], setup: "ORB long on London open after Asia sweep", day: 0, hour: 9, min: 42 },
    { pair: "GBP/JPY", dir: "SHORT", asset: "FOREX", entry: "194.820", sl: "195.120", tp: "194.180", pnl: -185, rr: -1.0, status: "CLOSED", grade: "Low probability", tags: ["Reversal", "News"], setup: "Counter-trend on rejection wick — held past stop", day: 0, hour: 13, min: 15 },
    { pair: "XAU/USD", dir: "LONG", asset: "OTHER", entry: "2342.10", sl: "2336.80", tp: "2358.40", pnl: 612, rr: 3.1, status: "CLOSED", grade: "High probability", tags: ["Breakout", "A+ setup"], setup: "Breakout from 4H consolidation w/ DXY softness", day: 1, hour: 14, min: 30 },
    { pair: "BTC/USD", dir: "LONG", asset: "CRYPTO", entry: "67120", sl: "66420", tp: "0", pnl: null, rr: null, status: "OPEN", grade: "High probability", tags: ["Swing", "Trend cont."], setup: "Weekly trend up; post-CPI continuation", day: 2, hour: 9, min: 10 },
    { pair: "AUD/USD", dir: "SHORT", asset: "FOREX", entry: "0.66420", sl: "0.66580", tp: "0.66100", pnl: 192, rr: 1.4, status: "CLOSED", grade: "High probability", tags: ["Confirmation"], setup: "Failed breakout at prior week high", day: 3, hour: 11, min: 55 },
    { pair: "USD/CAD", dir: "LONG", asset: "FOREX", entry: "1.36210", sl: "1.36050", tp: "1.36520", pnl: -160, rr: -1.0, status: "CLOSED", grade: "Low probability", tags: ["News play"], setup: "Chased CAD CPI miss without confirmation", day: 3, hour: 9, min: 34 },
    { pair: "EUR/GBP", dir: "LONG", asset: "FOREX", entry: "0.84120", sl: "0.84020", tp: "0.84320", pnl: 95, rr: 1.0, status: "CLOSED", grade: "Low probability", tags: ["VWAP bounce"], setup: "Reclaim of session VWAP, small size", day: 4, hour: 14, min: 5 },
    { pair: "XAU/USD", dir: "LONG", asset: "OTHER", entry: "2328.40", sl: "2322.10", tp: "2342.20", pnl: 410, rr: 2.2, status: "CLOSED", grade: "High probability", tags: ["Trend cont."], setup: "Pullback to 20EMA on H1 in clean uptrend", day: 4, hour: 10, min: 18 },
    { pair: "GBP/USD", dir: "SHORT", asset: "FOREX", entry: "1.26840", sl: "1.27020", tp: "1.26420", pnl: 218, rr: 2.3, status: "CLOSED", grade: "High probability", tags: ["Reversal"], setup: "Failed B/D on H4; clean reversal candle", day: 5, hour: 8, min: 45 },
    { pair: "NZD/USD", dir: "LONG", asset: "FOREX", entry: "0.59820", sl: "0.59720", tp: "0.60020", pnl: -100, rr: -1.0, status: "CLOSED", grade: "Low probability", tags: ["Confirmation"], setup: "Stop hit on Fed minutes spike", day: 6, hour: 13, min: 20 },
  ];

  // Tags
  const tagNames = [...new Set(trades.flatMap((t) => t.tags))];
  const tagMap = new Map<string, string>();
  for (const name of tagNames) {
    const tag = await prisma.tag.create({ data: { userId: user.id, name } });
    tagMap.set(name, tag.id);
  }

  for (const t of trades) {
    const entryAt = daysAgo(t.day, t.hour, t.min);
    await prisma.trade.create({
      data: {
        userId: user.id,
        accountId: live.id,
        pair: t.pair,
        assetClass: t.asset,
        direction: t.dir,
        status: t.status,
        entryPrice: num(t.entry),
        sl: num(t.sl) || null,
        tp: t.tp === "0" ? null : num(t.tp),
        pnl: t.pnl,
        rr: t.rr,
        grade: t.grade,
        setup: t.setup,
        entryAt,
        exitAt: t.status === "CLOSED" ? new Date(entryAt.getTime() + 3 * 3600_000) : null,
        tags: { create: t.tags.map((name) => ({ tagId: tagMap.get(name)! })) },
      },
    });
  }

  await prisma.missedTrade.createMany({
    data: [
      { userId: user.id, pair: "EUR/USD", direction: "LONG", reason: "Hesitated at entry — was at lunch", potential: "+1.8R", grade: "High probability", occurredAt: daysAgo(0, 12, 10) },
      { userId: user.id, pair: "XAU/USD", direction: "SHORT", reason: "Didn't take the H4 reversal — broke my own rule #3", potential: "+2.4R", grade: "High probability", occurredAt: daysAgo(1, 15, 55) },
      { userId: user.id, pair: "GBP/USD", direction: "LONG", reason: "No confirmation candle, passed", potential: "—", grade: "Low probability", occurredAt: daysAgo(2, 10, 0) },
    ],
  });

  await prisma.backtest.createMany({
    data: [
      { userId: user.id, name: "London ORB · EUR/USD · 2024 Q1", tradeCount: 64, winRate: 58, avgR: 0.74, net: 4820, period: "Jan–Mar 2024" },
      { userId: user.id, name: "Trend-cont. pullback · XAU/USD · 2024", tradeCount: 41, winRate: 71, avgR: 1.12, net: 6210, period: "Jan–Dec 2024" },
      { userId: user.id, name: "Failed B/D · GBP/JPY · 2024", tradeCount: 28, winRate: 64, avgR: 0.92, net: 2740, period: "2024 full year" },
      { userId: user.id, name: "VWAP reclaim · indices · 2024 H2", tradeCount: 19, winRate: 52, avgR: 0.41, net: 580, period: "Jul–Dec 2024" },
    ],
  });

  const rules = [
    { text: "No trades in the first 5 minutes of London open.", category: "Timing", active: true },
    { text: "Risk per trade ≤ 1% of account.", category: "Risk", active: true },
    { text: "Must have entry confirmation candle on execution timeframe.", category: "Entry", active: true },
    { text: "Never add to a losing position.", category: "Management", active: true },
    { text: "Max 3 trades per session.", category: "Volume", active: false },
    { text: "No trading 30 min before red-folder news.", category: "News", active: true },
    { text: "Stop must be at structure, not arbitrary pips.", category: "Risk", active: true },
  ];
  for (let i = 0; i < rules.length; i++) {
    await prisma.rule.create({ data: { userId: user.id, ...rules[i], order: i } });
  }

  await prisma.document.createMany({
    data: [
      { userId: user.id, kind: "template", builtIn: true, name: "Confirmation entry", content: { text: "Pullback to key level → engulfing on execution TF → enter on close, stop below swing." } },
      { userId: user.id, kind: "template", builtIn: true, name: "Breakout retest", content: { text: "Break of structure → wait for retest of broken level → enter on rejection." } },
      { userId: user.id, kind: "template", builtIn: true, name: "Failed breakdown / breakout", content: { text: "Sweep of liquidity → quick reclaim → enter on first pullback inside range." } },
      { userId: user.id, kind: "doc", name: "Weekly review — template", content: { text: "What went well / what didn't / rule adherence / focus for next week." } },
    ],
  });

  // Today's AI insight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.insight.create({
    data: {
      userId: user.id,
      date: today,
      tag: "Edge",
      content: "Your XAU/USD trades have a 71% win rate this month. Bias your A-book here and keep position sizing consistent.",
      model: "seed",
    },
  });

  // A notebook entry for today
  await prisma.notebookEntry.create({
    data: {
      userId: user.id,
      date: today,
      title: "Daily breakdown",
      content: { text: "London session: clean ORB long on EUR/USD. Took a low-probability GBP/JPY counter-trend — flagged for review." },
    },
  });

  console.log(`Seeded demo user ${DEMO_EMAIL} (password: ${DEMO_PASSWORD})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
