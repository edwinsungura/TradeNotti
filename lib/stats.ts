/**
 * Pure trade-performance calculations. No DB / framework deps so they can be
 * unit-tested in isolation and reused across server + client.
 */

export type StatTrade = {
  pnl?: number | null;
  rr?: number | null;
  status?: string | null; // "open" | "closed"
};

export type PerformanceStats = {
  closedCount: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number; // 0..1
  netPnl: number;
  avgR: number;
  profitFactor: number | null; // null when no losing $
  expectancy: number; // avg pnl per closed trade
  maxDrawdown: number; // largest peak-to-trough drop on the equity curve
  bestTrade: number;
  worstTrade: number;
};

function isClosed(t: StatTrade) {
  return t.status !== "open" && t.pnl != null;
}

/** Cumulative equity curve from a starting balance (defaults to 0). */
export function equityCurve(trades: StatTrade[], start = 0): number[] {
  const curve: number[] = [start];
  let running = start;
  for (const t of trades) {
    if (!isClosed(t)) continue;
    running += t.pnl ?? 0;
    curve.push(running);
  }
  return curve;
}

export function maxDrawdown(curve: number[]): number {
  let peak = curve[0] ?? 0;
  let maxDd = 0;
  for (const v of curve) {
    if (v > peak) peak = v;
    const dd = peak - v;
    if (dd > maxDd) maxDd = dd;
  }
  return maxDd;
}

export function computeStats(trades: StatTrade[], startBalance = 0): PerformanceStats {
  const closed = trades.filter(isClosed);
  const closedCount = closed.length;

  let wins = 0,
    losses = 0,
    breakeven = 0,
    netPnl = 0,
    grossProfit = 0,
    grossLoss = 0,
    rSum = 0,
    rCount = 0,
    best = 0,
    worst = 0;

  for (const t of closed) {
    const pnl = t.pnl ?? 0;
    netPnl += pnl;
    if (pnl > 0) {
      wins++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      losses++;
      grossLoss += Math.abs(pnl);
    } else {
      breakeven++;
    }
    if (pnl > best) best = pnl;
    if (pnl < worst) worst = pnl;
    if (t.rr != null) {
      rSum += t.rr;
      rCount++;
    }
  }

  const decided = wins + losses;
  const winRate = decided > 0 ? wins / decided : 0;
  const avgR = rCount > 0 ? rSum / rCount : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? null : 0;
  const expectancy = closedCount > 0 ? netPnl / closedCount : 0;
  const dd = maxDrawdown(equityCurve(closed, startBalance));

  return {
    closedCount,
    wins,
    losses,
    breakeven,
    winRate,
    netPnl,
    avgR,
    profitFactor,
    expectancy,
    maxDrawdown: dd,
    bestTrade: best,
    worstTrade: worst,
  };
}

/** Group closed-trade P&L by an arbitrary key extractor (e.g. pair, day). */
export function pnlByKey<T extends StatTrade>(trades: T[], keyOf: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of trades) {
    if (!isClosed(t)) continue;
    const k = keyOf(t);
    out[k] = (out[k] ?? 0) + (t.pnl ?? 0);
  }
  return out;
}
