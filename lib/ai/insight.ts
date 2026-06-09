import OpenAI from "openai";
import { startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { computeStats, pnlByKey } from "@/lib/stats";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

function formatMoney(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`;
}

export type GeneratedInsight = { tag: string; content: string; model: string; tokensUsed: number | null };

/** Build a compact, structured summary of a user's recent trading for the prompt. */
async function buildContext(userId: string) {
  const since = subDays(new Date(), 30);
  const [trades, rules] = await Promise.all([
    prisma.trade.findMany({
      where: { userId, entryAt: { gte: since } },
      include: { tags: { include: { tag: true } } },
      orderBy: { entryAt: "desc" },
      take: 60,
    }),
    prisma.rule.findMany({ where: { userId, active: true }, orderBy: { order: "asc" } }),
  ]);

  const stat = trades.map((t) => ({ pnl: t.pnl, rr: t.rr, status: t.status === "OPEN" ? "open" : "closed" }));
  const s = computeStats(stat);
  const byPair = pnlByKey(
    trades.map((t) => ({ pnl: t.pnl, status: t.status === "OPEN" ? "open" : "closed", pair: t.pair })),
    (t) => t.pair,
  );

  return {
    hasData: trades.length > 0,
    summary: {
      windowDays: 30,
      closedTrades: s.closedCount,
      winRate: Math.round(s.winRate * 100),
      avgR: Number(s.avgR.toFixed(2)),
      netPnl: Math.round(s.netPnl),
      profitFactor: s.profitFactor == null ? null : Number(s.profitFactor.toFixed(2)),
      maxDrawdown: Math.round(s.maxDrawdown),
      pnlByPair: Object.fromEntries(Object.entries(byPair).map(([k, v]) => [k, Math.round(v)])),
      activeRules: rules.map((r) => r.text),
    },
    stat: s,
    byPair,
  };
}

/** Deterministic fallback when no OpenAI key is configured. */
function fallbackInsight(ctx: Awaited<ReturnType<typeof buildContext>>): GeneratedInsight {
  const pairs = Object.entries(ctx.byPair).sort((a, b) => b[1] - a[1]);
  const best = pairs[0];
  let tag = "Edge";
  let content: string;
  if (!ctx.hasData) {
    content = "Log a few trades this week and your daily insight will start spotting where your edge, risk, and timing line up.";
  } else if (best && best[1] > 0) {
    content = `Your strongest market lately is ${best[0]} at ${formatMoney(best[1])}. Win rate is ${ctx.summary.winRate}% with an average of ${ctx.summary.avgR >= 0 ? "+" : ""}${ctx.summary.avgR}R — keep sizing consistent on your A-book setups here.`;
  } else {
    tag = "Risk";
    content = `Net P&L over the last 30 days is ${formatMoney(ctx.summary.netPnl)} with a max drawdown of ${formatMoney(-ctx.summary.maxDrawdown)}. Tighten entries to your highest-probability setups and review any rule breaks.`;
  }
  return { tag, content, model: "fallback", tokensUsed: null };
}

export async function generateInsightText(userId: string): Promise<GeneratedInsight> {
  const ctx = await buildContext(userId);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackInsight(ctx);

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a sharp, supportive trading coach for a forex & crypto trader. Given a JSON summary of their last 30 days, write ONE concise, specific, actionable daily insight (max 60 words). Focus on their edge, risk discipline, or timing. Reference their real numbers. Respond as JSON: {\"tag\": one of \"Edge\"|\"Risk\"|\"Time\", \"content\": string}.",
        },
        { role: "user", content: JSON.stringify(ctx.summary) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { tag?: string; content?: string };
    const tag = ["Edge", "Risk", "Time"].includes(parsed.tag ?? "") ? parsed.tag! : "Edge";
    const content = (parsed.content ?? "").trim() || fallbackInsight(ctx).content;
    return { tag, content, model: MODEL, tokensUsed: completion.usage?.total_tokens ?? null };
  } catch (err) {
    console.error("OpenAI insight generation failed:", err);
    return fallbackInsight(ctx);
  }
}

/** Generate + persist today's insight for a user, idempotently (one per day). */
export async function generateDailyInsight(userId: string, force = false) {
  const today = startOfDay(new Date());
  const existing = await prisma.insight.findUnique({ where: { userId_date: { userId, date: today } } });
  if (existing && !force) return { created: false, insight: existing };

  const gen = await generateInsightText(userId);
  const insight = await prisma.insight.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, tag: gen.tag, content: gen.content, model: gen.model, tokensUsed: gen.tokensUsed },
    update: { tag: gen.tag, content: gen.content, model: gen.model, tokensUsed: gen.tokensUsed },
  });
  return { created: !existing, insight };
}
