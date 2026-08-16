import type { PricePoint, Quote } from "@/lib/types/market";

export type TacticalComponents = {
  earningsRevisions: number;
  fundamentals: number;
  relativeStrength: number;
  technicalTrend: number;
  valuation: number;
  sectorStrength: number;
  fcfQuality: number;
  riskReward: number;
};

export type Snapshot = {
  quote: Quote;
  history: PricePoint[];
  technicals: {
    ma20: number | null;
    ma50: number | null;
    ma200: number | null;
    rsi14: number | null;
    percentFromMa50: number | null;
    percentFromMa200: number | null;
  };
  valuation: {
    forwardPE: number | null;
    peg: number | null;
    fcfYield: number | null;
    status: string;
  };
  fairValue: {
    bear: number;
    base: number;
    bull: number;
    impliedGrowth: number;
  };
  tactical: {
    score: number;
    rating: string;
    components: TacticalComponents;
    confidence: string;
  };
  lastUpdated: string;
};
