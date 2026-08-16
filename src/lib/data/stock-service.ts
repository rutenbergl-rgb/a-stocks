import { movingAverage, percentFromMA, relativeStrength, rsi } from "@/lib/calc/indicators";
import { tacticalRating, tacticalScore } from "@/lib/calc/tactical";
import {
  dcfValuePerShare,
  fairValueFromPE,
  fcfYield,
  forwardPE,
  pegRatio,
  reverseDcfImpliedGrowth,
} from "@/lib/calc/valuation";
import { getProvider } from "@/lib/data/provider-factory";
import type { SearchResult } from "@/lib/types/market";

export async function searchTickers(query: string): Promise<SearchResult[]> {
  return getProvider().searchTickers(query);
}

export async function getStockSnapshot(ticker: string) {
  const provider = getProvider();
  const [quote, history, fundamentals, relativeHistory] = await Promise.all([
    provider.getQuote(ticker),
    provider.getHistory(ticker, "1Y"),
    provider.getFundamentals(ticker),
    provider.getHistory("SPY", "1Y"),
  ]);

  const closes = history.map((d) => d.close);
  const ma20 = movingAverage(closes, 20);
  const ma50 = movingAverage(closes, 50);
  const ma200 = movingAverage(closes, 200);
  const rsi14 = rsi(closes, 14);

  const stock1m = ((closes.at(-1) ?? 0) - (closes.at(-22) ?? closes.at(-1) ?? 0)) / (closes.at(-22) ?? closes.at(-1) ?? 1) * 100;
  const benchCloses = relativeHistory.map((d) => d.close);
  const bench1m = ((benchCloses.at(-1) ?? 0) - (benchCloses.at(-22) ?? benchCloses.at(-1) ?? 0)) / (benchCloses.at(-22) ?? benchCloses.at(-1) ?? 1) * 100;
  const rel1m = relativeStrength(stock1m, bench1m);

  const fwdPe = forwardPE(quote.price, fundamentals.epsForward);
  const peg = fwdPe ? pegRatio(fwdPe, fundamentals.epsGrowth) : null;
  const fcfY = fcfYield(fundamentals.fcf, quote.marketCap);

  const peBear = fairValueFromPE(fundamentals.epsForward, 22);
  const peBase = fairValueFromPE(fundamentals.epsForward, 30);
  const peBull = fairValueFromPE(fundamentals.epsForward, 38);

  const dcfBase = dcfValuePerShare({
    revenue: quote.marketCap * 0.17,
    growthRates: [0.12, 0.1, 0.09, 0.08, 0.07],
    operatingMargin: 0.27,
    taxRate: 0.18,
    fcfConversion: 0.82,
    discountRate: 0.1,
    terminalGrowth: 0.03,
    sharesOutstanding: fundamentals.sharesOutstanding,
    netDebt: fundamentals.netDebt,
  });

  const impliedGrowth = reverseDcfImpliedGrowth(
    quote.price,
    quote.marketCap * 0.17,
    0.27,
    0.18,
    0.82,
    0.1,
    0.03,
    5,
    fundamentals.sharesOutstanding,
    fundamentals.netDebt,
  );

  const valuationScore =
    !fwdPe || fwdPe >= 45 ? 30 :
    fwdPe >= 35 ? 45 :
    fwdPe >= 28 ? 60 :
    75;

  const components = {
    earningsRevisions: 68,
    fundamentals: Math.min(95, Math.max(40, 50 + fundamentals.epsGrowth)),
    relativeStrength: Math.min(95, Math.max(20, 60 + rel1m)),
    technicalTrend: ma50 && ma200 && quote.price > ma50 && ma50 > ma200 ? 82 : 52,
    valuation: valuationScore,
    sectorStrength: 70,
    fcfQuality: Math.min(95, Math.max(35, (fcfY ?? 2) * 8)),
    riskReward: 62,
  };

  const score = tacticalScore(components);

  return {
    quote,
    history,
    technicals: {
      ma20,
      ma50,
      ma200,
      rsi14,
      percentFromMa50: percentFromMA(quote.price, ma50),
      percentFromMa200: percentFromMA(quote.price, ma200),
    },
    valuation: {
      forwardPE: fwdPe,
      peg,
      fcfYield: fcfY,
      status: !fwdPe ? "N/M" : fwdPe > 38 ? "Expensive" : fwdPe > 30 ? "Modestly Expensive" : fwdPe > 22 ? "Fair Value" : "Undervalued",
    },
    fairValue: {
      bear: Number(peBear.toFixed(2)),
      base: Number(((peBase + dcfBase) / 2).toFixed(2)),
      bull: Number(peBull.toFixed(2)),
      impliedGrowth,
    },
    tactical: {
      score,
      rating: tacticalRating(score),
      components,
      confidence: score >= 75 ? "High" : score >= 55 ? "Medium" : "Low",
    },
    lastUpdated: new Date().toISOString(),
  };
}
