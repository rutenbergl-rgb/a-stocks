import { addDays, formatISO } from "./utils";
import { DataProvider } from "./types";
import { Fundamentals, PriceBar, Quote } from "@/lib/types";

const sectors = ["Technology", "Industrials", "Utilities", "Financials", "Healthcare"];

const seeded = (ticker: string) => ticker.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

const makeHistory = (ticker: string, points = 260): PriceBar[] => {
  const seed = seeded(ticker);
  let price = 60 + (seed % 140);

  return Array.from({ length: points }, (_, index) => {
    const drift = 0.0006 + ((seed % 7) - 3) * 0.00008;
    const cycle = Math.sin(index / 12 + seed / 10) * 0.008;
    const shock = Math.cos(index / 5 + seed / 4) * 0.004;
    const ret = drift + cycle + shock;

    const open = price;
    price = Math.max(5, price * (1 + ret));
    const close = price;
    const high = Math.max(open, close) * 1.01;
    const low = Math.min(open, close) * 0.99;

    return {
      date: formatISO(addDays(new Date(), -(points - index))),
      open,
      high,
      low,
      close,
      volume: Math.round(500_000 + ((seed * 1111 + index * 999) % 4_000_000)),
    };
  });
};

const historyCache = new Map<string, PriceBar[]>();

const getOrCreateHistory = (ticker: string) => {
  const key = ticker.toUpperCase();
  if (!historyCache.has(key)) historyCache.set(key, makeHistory(key));
  return historyCache.get(key)!;
};

const rangeToPoints = { "1M": 22, "3M": 66, "6M": 132, "1Y": 252 } as const;

export const demoProvider: DataProvider = {
  async searchTickers(query) {
    const q = query.toUpperCase();
    const defaults = (process.env.NEXT_PUBLIC_DEFAULT_TICKERS ?? "NVDA,MSFT,META,GEV,VRT")
      .split(",")
      .map((ticker) => ticker.trim())
      .filter(Boolean);

    return defaults
      .filter((ticker) => ticker.includes(q))
      .slice(0, 10)
      .map((ticker) => ({ ticker, name: `${ticker} Holdings Inc.` }));
  },

  async getQuote(ticker: string): Promise<Quote> {
    const symbol = ticker.toUpperCase();
    const history = getOrCreateHistory(symbol);
    const latest = history.at(-1)!;
    const prev = history.at(-2) ?? latest;
    const changePct = ((latest.close - prev.close) / prev.close) * 100;
    const seed = seeded(symbol);

    return {
      ticker: symbol,
      name: `${symbol} Holdings Inc.`,
      price: latest.close,
      changePct,
      marketCap: (20 + (seed % 200)) * 1_000_000_000,
      sector: sectors[seed % sectors.length],
      industry: "Infrastructure & Software",
    };
  },

  async getHistory(ticker, range = "1Y") {
    const history = getOrCreateHistory(ticker.toUpperCase());
    return history.slice(-rangeToPoints[range]);
  },

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    const seed = seeded(ticker.toUpperCase());
    const forwardEps = 2 + (seed % 50) / 5;
    const expectedGrowthPct = 8 + (seed % 24);

    return {
      forwardEps,
      nextYearEps: forwardEps * 1.15,
      expectedGrowthPct,
      freeCashFlow: (1 + (seed % 40)) * 1_000_000_000,
      revenueGrowthPct: 4 + (seed % 20),
      epsGrowthPct: expectedGrowthPct,
    };
  },
};
