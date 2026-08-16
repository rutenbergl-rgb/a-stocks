import { describe, expect, it } from "vitest";
import {
  computeRsi,
  dcfFairValue,
  fairValueFromForwardPe,
  fcfYield,
  pegRatio,
  relativeStrength,
  reverseDcfGrowthRate,
  simpleMovingAverage,
  tacticalScore,
} from "@/lib/finance/calculations";
import { PriceBar } from "@/lib/types";

const bars = (values: number[]): PriceBar[] =>
  values.map((close, index) => ({
    date: new Date(2024, 0, index + 1).toISOString(),
    open: close,
    high: close,
    low: close,
    close,
    volume: 100,
  }));

describe("financial calculations", () => {
  it("computes simple moving average", () => {
    expect(simpleMovingAverage([1, 2, 3, 4, 5], 3)).toBe(4);
  });

  it("computes RSI and keeps bounds", () => {
    const rsi = computeRsi([10, 11, 12, 11, 12, 13, 14, 15, 14, 15, 16, 17, 18, 19, 20], 14);
    expect(rsi).not.toBeNull();
    expect(rsi!).toBeGreaterThanOrEqual(0);
    expect(rsi!).toBeLessThanOrEqual(100);
  });

  it("computes relative strength spread", () => {
    const rs = relativeStrength(bars([10, 11, 12]), bars([10, 10.5, 11]), 3);
    expect(rs).toBeCloseTo(10, 1);
  });

  it("computes PEG", () => {
    expect(pegRatio(30, 20)).toBe(1.5);
  });

  it("computes FCF yield", () => {
    expect(fcfYield(2_000_000_000, 50_000_000_000)).toBe(4);
  });

  it("computes fair values from P/E", () => {
    expect(fairValueFromForwardPe(10, 20, 25, 30)).toEqual({ bear: 200, base: 250, bull: 300 });
  });

  it("computes DCF and reverse DCF coherently", () => {
    const fair = dcfFairValue({
      revenue: 1_000,
      growthRate: 0.1,
      operatingMargin: 0.25,
      taxRate: 0.2,
      fcfConversion: 0.9,
      discountRate: 0.1,
      terminalGrowth: 0.03,
      sharesOutstanding: 10,
    });

    const impliedGrowth = reverseDcfGrowthRate({
      currentPrice: fair,
      revenue: 1_000,
      operatingMargin: 0.25,
      taxRate: 0.2,
      fcfConversion: 0.9,
      discountRate: 0.1,
      terminalGrowth: 0.03,
      sharesOutstanding: 10,
    });

    expect(impliedGrowth).toBeCloseTo(10, 1);
  });

  it("computes tactical score", () => {
    expect(
      tacticalScore({
        earningsRevisions: 80,
        fundamentals: 75,
        relativeStrength: 70,
        technicalTrend: 85,
        valuation: 60,
        sectorStrength: 70,
        fcfQuality: 65,
        riskReward: 60,
      }),
    ).toBeGreaterThan(70);
  });
});
