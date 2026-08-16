import { DataProvider } from "./types";
import { Fundamentals, PriceBar, Quote } from "@/lib/types";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";

const withKey = (url: string) => `${url}${url.includes("?") ? "&" : "?"}apikey=${process.env.FMP_API_KEY}`;

const getJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(withKey(url), { cache: "no-store" });
  if (!res.ok) throw new Error(`FMP request failed: ${res.status}`);
  return res.json() as Promise<T>;
};

export const fmpProvider: DataProvider = {
  async searchTickers(query) {
    if (!query.trim()) return [];
    const rows = await getJson<Array<{ symbol: string; name: string }>>(
      `${FMP_BASE}/search-ticker?query=${encodeURIComponent(query)}&limit=10`,
    );

    return rows.map((row) => ({ ticker: row.symbol, name: row.name }));
  },

  async getQuote(ticker: string): Promise<Quote> {
    const [row] = await getJson<Array<Record<string, unknown>>>(`${FMP_BASE}/quote/${ticker}`);
    if (!row) throw new Error("Ticker not found");

    return {
      ticker: String(row.symbol),
      name: String(row.name),
      price: Number(row.price),
      changePct: Number(row.changesPercentage),
      marketCap: Number(row.marketCap),
      sector: undefined,
      industry: undefined,
    };
  },

  async getHistory(ticker: string, range = "1Y"): Promise<PriceBar[]> {
    const fromByRange: Record<typeof range, string> = {
      "1M": "2025-01-01",
      "3M": "2024-10-01",
      "6M": "2024-07-01",
      "1Y": "2024-01-01",
    };
    const data = await getJson<{
      historical: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
    }>(`${FMP_BASE}/historical-price-full/${ticker}?from=${fromByRange[range]}`);

    return data.historical
      .map((bar) => ({ ...bar }))
      .reverse()
      .map((bar) => ({
        date: `${bar.date}T00:00:00.000Z`,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
      }));
  },

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    const [row] = await getJson<Array<Record<string, unknown>>>(`${FMP_BASE}/analyst-estimates/${ticker}`);

    return {
      forwardEps: row?.estimatedEpsAvg ? Number(row.estimatedEpsAvg) : undefined,
      nextYearEps: row?.estimatedEpsAvg ? Number(row.estimatedEpsAvg) * 1.1 : undefined,
      expectedGrowthPct: row?.estimatedEpsGrowth ? Number(row.estimatedEpsGrowth) * 100 : undefined,
      freeCashFlow: undefined,
      revenueGrowthPct: row?.estimatedRevenueAvg ? 10 : undefined,
      epsGrowthPct: row?.estimatedEpsGrowth ? Number(row.estimatedEpsGrowth) * 100 : undefined,
    };
  },
};
