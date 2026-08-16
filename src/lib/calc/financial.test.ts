import { describe, expect, it } from "vitest";
import { movingAverage, relativeStrength, rsi } from "@/lib/calc/indicators";
import {
  dcfValuePerShare,
  fairValueFromPE,
  fcfYield,
  forwardPE,
  pegRatio,
  reverseDcfImpliedGrowth,
} from "@/lib/calc/valuation";
import { tacticalRating, tacticalScore } from "@/lib/calc/tactical";

describe("financial calculations", () => {
  it("calculates moving average", () => {
    expect(movingAverage([1, 2, 3, 4, 5], 3)).toBe(4);
  });

  it("calculates RSI deterministically", () => {
    const values = [44, 44.15, 43.9, 44.35, 44.7, 44.3, 44.1, 43.95, 44.2, 44.6, 44.9, 45.1, 44.8, 45.0, 45.2, 45.3];
    const val = rsi(values, 14);
    expect(val).not.toBeNull();
    expect(val!).toBeGreaterThan(0);
    expect(val!).toBeLessThan(100);
  });

  it("calculates relative strength spread", () => {
    expect(relativeStrength(12, 8)).toBe(4);
  });

  it("handles PEG and P/E", () => {
    expect(forwardPE(120, 4)).toBe(30);
    expect(pegRatio(30, 15)).toBe(2);
    expect(forwardPE(100, -1)).toBeNull();
  });

  it("calculates FCF yield", () => {
    expect(fcfYield(5_000, 100_000)).toBe(5);
  });

  it("calculates DCF and reverse DCF", () => {
    const dcf = dcfValuePerShare({
      revenue: 10_000,
      growthRates: [0.1, 0.1, 0.1, 0.08, 0.07],
      operatingMargin: 0.25,
      taxRate: 0.2,
      fcfConversion: 0.8,
      discountRate: 0.1,
      terminalGrowth: 0.03,
      sharesOutstanding: 1_000,
      netDebt: 500,
    });
    expect(dcf).toBeGreaterThan(0);

    const implied = reverseDcfImpliedGrowth(60, 10_000, 0.25, 0.2, 0.8, 0.1, 0.03, 5, 1_000, 500);
    expect(implied).toBeGreaterThan(-20);
    expect(implied).toBeLessThan(60);
  });

  it("calculates fair value from PE", () => {
    expect(fairValueFromPE(10, 30)).toBe(300);
  });

  it("calculates tactical score and rating", () => {
    const score = tacticalScore({
      earningsRevisions: 80,
      fundamentals: 75,
      relativeStrength: 72,
      technicalTrend: 70,
      valuation: 55,
      sectorStrength: 65,
      fcfQuality: 60,
      riskReward: 58,
    });
    expect(score).toBeGreaterThan(60);
    expect(tacticalRating(score)).toMatch(/HOLD|TRIM|ACCUMULATE/);
  });
});
