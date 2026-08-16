import { PriceBar, TacticalComponentScores, TacticalRating } from "@/lib/types";

export const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

export const simpleMovingAverage = (values: number[], period: number): number | null => {
  if (values.length < period || period <= 0) return null;
  return average(values.slice(-period));
};

export const computeRsi = (closes: number[], period = 14): number | null => {
  if (closes.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i += 1) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
};

export const relativeStrength = (
  stockHistory: PriceBar[],
  benchmarkHistory: PriceBar[],
  days: number,
): number | null => {
  if (stockHistory.length < days || benchmarkHistory.length < days) return null;

  const stockSlice = stockHistory.slice(-days);
  const benchmarkSlice = benchmarkHistory.slice(-days);
  const stockReturn = (stockSlice.at(-1)!.close - stockSlice[0].close) / stockSlice[0].close;
  const benchmarkReturn =
    (benchmarkSlice.at(-1)!.close - benchmarkSlice[0].close) / benchmarkSlice[0].close;

  return (stockReturn - benchmarkReturn) * 100;
};

export const pegRatio = (forwardPe: number | null, growthPct: number | null): number | null => {
  if (!forwardPe || !growthPct || growthPct <= 0) return null;
  return forwardPe / growthPct;
};

export const fcfYield = (freeCashFlow: number | null, marketCap: number | null): number | null => {
  if (!freeCashFlow || !marketCap || marketCap <= 0) return null;
  return (freeCashFlow / marketCap) * 100;
};

export type DcfInputs = {
  revenue: number;
  growthRate: number;
  operatingMargin: number;
  taxRate: number;
  fcfConversion: number;
  discountRate: number;
  terminalGrowth: number;
  sharesOutstanding: number;
  years?: number;
};

export const dcfFairValue = ({
  revenue,
  growthRate,
  operatingMargin,
  taxRate,
  fcfConversion,
  discountRate,
  terminalGrowth,
  sharesOutstanding,
  years = 5,
}: DcfInputs): number => {
  let projectedRevenue = revenue;
  let pvFcf = 0;

  for (let year = 1; year <= years; year += 1) {
    projectedRevenue *= 1 + growthRate;
    const ebit = projectedRevenue * operatingMargin;
    const nopat = ebit * (1 - taxRate);
    const fcf = nopat * fcfConversion;
    pvFcf += fcf / (1 + discountRate) ** year;
  }

  const terminalFcf =
    projectedRevenue * operatingMargin * (1 - taxRate) * fcfConversion * (1 + terminalGrowth);
  const terminalValue = terminalFcf / (discountRate - terminalGrowth);
  const pvTerminal = terminalValue / (1 + discountRate) ** years;

  return (pvFcf + pvTerminal) / sharesOutstanding;
};

export const reverseDcfGrowthRate = ({
  currentPrice,
  revenue,
  operatingMargin,
  taxRate,
  fcfConversion,
  discountRate,
  terminalGrowth,
  sharesOutstanding,
}: Omit<DcfInputs, "growthRate"> & { currentPrice: number }): number => {
  let low = -0.2;
  let high = 0.8;

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const fair = dcfFairValue({
      revenue,
      growthRate: mid,
      operatingMargin,
      taxRate,
      fcfConversion,
      discountRate,
      terminalGrowth,
      sharesOutstanding,
    });

    if (fair > currentPrice) high = mid;
    else low = mid;
  }

  return ((low + high) / 2) * 100;
};

export const fairValueFromForwardPe = (
  eps: number,
  bearMultiple: number,
  baseMultiple: number,
  bullMultiple: number,
) => ({
  bear: eps * bearMultiple,
  base: eps * baseMultiple,
  bull: eps * bullMultiple,
});

export const tacticalScore = (components: TacticalComponentScores): number => {
  const weighted =
    components.earningsRevisions * 0.2 +
    components.fundamentals * 0.15 +
    components.relativeStrength * 0.15 +
    components.technicalTrend * 0.15 +
    components.valuation * 0.15 +
    components.sectorStrength * 0.1 +
    components.fcfQuality * 0.05 +
    components.riskReward * 0.05;

  return Math.round(Math.max(0, Math.min(100, weighted)));
};

export const tacticalRating = (score: number): TacticalRating => {
  if (score >= 80) return "ACCUMULATE";
  if (score >= 65) return "HOLD";
  if (score >= 50) return "WATCH / WAIT";
  if (score >= 35) return "TRIM";
  return "AVOID";
};
