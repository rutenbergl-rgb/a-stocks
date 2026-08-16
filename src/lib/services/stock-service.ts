import {
  computeRsi,
  dcfFairValue,
  fairValueFromForwardPe,
  fcfYield,
  pegRatio,
  relativeStrength,
  simpleMovingAverage,
  tacticalRating,
  tacticalScore,
} from "@/lib/finance/calculations";
import { provider } from "@/lib/providers";

export const searchTickers = async (query: string) => provider.searchTickers(query);

export const getStockSnapshot = async (ticker: string) => {
  const normalized = ticker.toUpperCase();

  const [quote, history, benchmarkHistory, fundamentals] = await Promise.all([
    provider.getQuote(normalized),
    provider.getHistory(normalized, "1Y"),
    provider.getHistory("SPY", "1Y"),
    provider.getFundamentals(normalized),
  ]);

  const closes = history.map((bar) => bar.close);
  const ma20 = simpleMovingAverage(closes, 20);
  const ma50 = simpleMovingAverage(closes, 50);
  const ma200 = simpleMovingAverage(closes, 200);
  const rsi = computeRsi(closes, 14);
  const rs3m = relativeStrength(history, benchmarkHistory, 66);

  const forwardPe = fundamentals.forwardEps && fundamentals.forwardEps > 0 ? quote.price / fundamentals.forwardEps : null;
  const peg = pegRatio(forwardPe, fundamentals.expectedGrowthPct ?? null);
  const cashFlowYield = fcfYield(fundamentals.freeCashFlow ?? null, quote.marketCap ?? null);

  const peFair =
    fundamentals.nextYearEps && fundamentals.nextYearEps > 0
      ? fairValueFromForwardPe(fundamentals.nextYearEps, 18, 24, 30)
      : null;

  const dcfBase = dcfFairValue({
    revenue: 20_000_000_000,
    growthRate: 0.1,
    operatingMargin: 0.25,
    taxRate: 0.18,
    fcfConversion: 0.9,
    discountRate: 0.1,
    terminalGrowth: 0.03,
    sharesOutstanding: 1_000_000_000,
  });

  const components = {
    earningsRevisions: 70,
    fundamentals: Math.round(50 + (fundamentals.epsGrowthPct ?? 10)),
    relativeStrength: Math.round(60 + (rs3m ?? 0) / 2),
    technicalTrend:
      ma50 && ma200 ? (quote.price > ma50 && ma50 > ma200 ? 80 : quote.price > ma200 ? 60 : 35) : 50,
    valuation: forwardPe && forwardPe < 25 ? 75 : forwardPe && forwardPe < 35 ? 55 : 35,
    sectorStrength: 65,
    fcfQuality: cashFlowYield && cashFlowYield > 3 ? 75 : 55,
    riskReward: rsi && rsi > 72 ? 40 : rsi && rsi < 40 ? 70 : 60,
  };

  const score = tacticalScore(components);

  return {
    quote,
    history,
    benchmarkHistory,
    fundamentals,
    indicators: {
      ma20,
      ma50,
      ma200,
      rsi,
      rs3m,
      forwardPe,
      peg,
      cashFlowYield,
    },
    valuation: {
      peFair,
      dcfFairValue: dcfBase,
      valuationStatus:
        peFair?.base && quote.price <= peFair.base * 0.9
          ? "Undervalued"
          : peFair?.base && quote.price >= peFair.base * 1.1
            ? "Modestly Expensive"
            : "Fair Value",
    },
    tactical: {
      components,
      score,
      rating: tacticalRating(score),
      confidence: score > 75 || score < 35 ? "Medium" : "Low",
    },
  };
};

export const getMarketRegimeSnapshot = async () => {
  const tickers = ["SPY", "QQQ", "IWM", "RSP"];
  const histories = await Promise.all(tickers.map((ticker) => provider.getHistory(ticker, "1Y")));

  const trendScores = histories.map((history) => {
    const closes = history.map((bar) => bar.close);
    const ma50 = simpleMovingAverage(closes, 50);
    const ma200 = simpleMovingAverage(closes, 200);
    const price = closes.at(-1) ?? 0;
    if (!ma50 || !ma200) return 50;
    if (price > ma50 && ma50 > ma200) return 90;
    if (price > ma200) return 70;
    if (price > ma50) return 55;
    return 25;
  });

  const indexTrend = Math.round(trendScores.reduce((a, b) => a + b, 0) / trendScores.length);
  const breadth = Math.min(100, Math.max(0, Math.round(indexTrend - 5)));
  const score = Math.round(
    indexTrend * 0.2 + breadth * 0.2 + 60 * 0.2 + 55 * 0.15 + 50 * 0.1 + 55 * 0.1 + 60 * 0.05,
  );

  const regime =
    score >= 85
      ? "STRONG BULL"
      : score >= 70
        ? "BULL"
        : score >= 55
          ? "BULL WITH CAUTION"
          : score >= 40
            ? "NEUTRAL / TRANSITION"
            : score >= 25
              ? "CORRECTION / DEFENSIVE"
              : "BEAR";

  return {
    score,
    regime,
    explanation:
      regime === "BULL"
        ? "Indexes remain above medium/long trends and participation is constructive."
        : regime === "BULL WITH CAUTION"
          ? "Long-term trend is intact, but participation and risk appetite are mixed."
          : "Trend and participation are mixed, so tactical selectivity is important.",
  };
};
