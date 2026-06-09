import { describe, expect, it } from "vitest";
import { computeStats, equityCurve, maxDrawdown, pnlByKey, type StatTrade } from "./stats";

const trades: StatTrade[] = [
  { pnl: 245, rr: 2.0, status: "closed" },
  { pnl: -120, rr: -1.0, status: "closed" },
  { pnl: 510, rr: 3.4, status: "closed" },
  { pnl: -100, rr: -1.0, status: "closed" },
  { pnl: 0, rr: 0, status: "closed" }, // breakeven
  { pnl: null, rr: null, status: "open" }, // open, excluded
];

describe("computeStats", () => {
  const s = computeStats(trades);

  it("counts only closed trades", () => {
    expect(s.closedCount).toBe(5);
  });

  it("computes wins/losses/breakeven", () => {
    expect(s.wins).toBe(2);
    expect(s.losses).toBe(2);
    expect(s.breakeven).toBe(1);
  });

  it("computes win rate over decided trades", () => {
    expect(s.winRate).toBeCloseTo(0.5, 5);
  });

  it("sums net P&L", () => {
    expect(s.netPnl).toBeCloseTo(535, 5);
  });

  it("averages R over trades that have an R value", () => {
    // (2.0 - 1.0 + 3.4 - 1.0 + 0) / 5
    expect(s.avgR).toBeCloseTo(0.68, 5);
  });

  it("computes profit factor = grossProfit / grossLoss", () => {
    // (245 + 510) / (120 + 100) = 755 / 220
    expect(s.profitFactor).toBeCloseTo(755 / 220, 5);
  });

  it("tracks best and worst trades", () => {
    expect(s.bestTrade).toBe(510);
    expect(s.worstTrade).toBe(-120);
  });
});

describe("equityCurve & maxDrawdown", () => {
  it("builds a cumulative curve from a start balance", () => {
    expect(equityCurve(trades, 1000)).toEqual([1000, 1245, 1125, 1635, 1535, 1535]);
  });

  it("finds the largest peak-to-trough drop", () => {
    expect(maxDrawdown([100, 120, 90, 130, 80])).toBe(50);
  });
});

describe("pnlByKey", () => {
  it("groups closed P&L by key", () => {
    const tagged = [
      { pnl: 100, status: "closed", pair: "EUR/USD" },
      { pnl: -40, status: "closed", pair: "EUR/USD" },
      { pnl: 200, status: "closed", pair: "XAU/USD" },
      { pnl: 999, status: "open", pair: "EUR/USD" },
    ];
    expect(pnlByKey(tagged, (t) => t.pair)).toEqual({ "EUR/USD": 60, "XAU/USD": 200 });
  });
});
