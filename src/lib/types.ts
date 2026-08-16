export type PriceBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Quote = {
  ticker: string;
  name: string;
  price: number;
  changePct: number;
  marketCap?: number;
  sector?: string;
  industry?: string;
};

export type Fundamentals = {
  forwardEps?: number;
  nextYearEps?: number;
  expectedGrowthPct?: number;
  freeCashFlow?: number;
  revenueGrowthPct?: number;
  epsGrowthPct?: number;
};

export type TacticalComponentScores = {
  earningsRevisions: number;
  fundamentals: number;
  relativeStrength: number;
  technicalTrend: number;
  valuation: number;
  sectorStrength: number;
  fcfQuality: number;
  riskReward: number;
};

export type TacticalRating = "ACCUMULATE" | "HOLD" | "TRIM" | "WATCH / WAIT" | "AVOID";

export type StockSnapshot = {
  quote: Quote;
  history: PriceBar[];
  benchmarkHistory: PriceBar[];
  fundamentals: Fundamentals;
};
