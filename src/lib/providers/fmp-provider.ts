import type { Fundamentals, PricePoint, Quote, SearchResult } from "@/lib/types/market";
import type { MarketDataProvider } from "@/lib/providers/provider";
import { MockProvider } from "@/lib/providers/mock-provider";

const baseUrl = "https://financialmodelingprep.com/stable";
const fallback = new MockProvider();

async function withFallback<T>(call: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch {
    return fallbackCall();
  }
}

function apiKeyParam() {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY not configured");
  return `apikey=${key}`;
}

export class FmpProvider implements MarketDataProvider {
  async searchTickers(query: string): Promise<SearchResult[]> {
    return withFallback(async () => {
      const res = await fetch(`${baseUrl}/search-symbol?query=${encodeURIComponent(query)}&${apiKeyParam()}`);
      if (!res.ok) throw new Error("search failed");
      const rows = (await res.json()) as Array<{ symbol: string; name: string; exchange: string }>;
      return rows.slice(0, 10).map((row) => ({ ticker: row.symbol, name: row.name, exchange: row.exchange }));
    }, () => fallback.searchTickers(query));
  }

  async getQuote(ticker: string): Promise<Quote> {
    return withFallback(async () => {
      const res = await fetch(`${baseUrl}/quote?symbol=${ticker}&${apiKeyParam()}`);
      if (!res.ok) throw new Error("quote failed");
      const rows = (await res.json()) as Array<Record<string, number | string>>;
      const row = rows[0];
      if (!row) throw new Error("no quote");
      return {
        ticker,
        name: String(row.name ?? ticker),
        price: Number(row.price ?? 0),
        changePercent: Number(row.changesPercentage ?? 0),
        marketCap: Number(row.marketCap ?? 0),
        sector: String(row.sector ?? "Unknown"),
        industry: String(row.industry ?? "Unknown"),
      };
    }, () => fallback.getQuote(ticker));
  }

  async getHistory(ticker: string): Promise<PricePoint[]> {
    return withFallback(async () => {
      const res = await fetch(`${baseUrl}/historical-price-eod/full?symbol=${ticker}&${apiKeyParam()}`);
      if (!res.ok) throw new Error("history failed");
      const rows = (await res.json()) as Array<{ date: string; close: number; volume: number }>;
      return rows.slice(0, 260).reverse().map((row) => ({ date: row.date, close: row.close, volume: row.volume }));
    }, () => fallback.getHistory(ticker, "1Y"));
  }

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    return withFallback(async () => {
      const [metricsRes, profileRes] = await Promise.all([
        fetch(`${baseUrl}/key-metrics-ttm?symbol=${ticker}&${apiKeyParam()}`),
        fetch(`${baseUrl}/company-core-information?symbol=${ticker}&${apiKeyParam()}`),
      ]);
      if (!metricsRes.ok || !profileRes.ok) throw new Error("fundamentals failed");
      const metrics = (await metricsRes.json()) as Array<Record<string, number>>;
      const profile = (await profileRes.json()) as Array<Record<string, number>>;
      const m = metrics[0];
      const p = profile[0];
      if (!m || !p) throw new Error("missing fundamentals");

      return {
        epsForward: Number(m.ttmEps ?? 0),
        epsGrowth: Number(m.netIncomeGrowth ?? 0) * 100,
        revenueGrowth: Number(m.revenueGrowth ?? 0) * 100,
        fcf: Number(m.freeCashFlowPerShare ?? 0) * Number(p.sharesOutstanding ?? 1),
        sharesOutstanding: Number(p.sharesOutstanding ?? 1),
        ebitda: Number(m.ebitda ?? 0),
        netDebt: Number(m.netDebt ?? 0),
      };
    }, () => fallback.getFundamentals(ticker));
  }
}
