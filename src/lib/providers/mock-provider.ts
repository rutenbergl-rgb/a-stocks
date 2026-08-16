import type { Fundamentals, PricePoint, Quote, SearchResult } from "@/lib/types/market";
import type { MarketDataProvider } from "@/lib/providers/provider";

const mockUniverse: SearchResult[] = [
  { ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { ticker: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { ticker: "GEV", name: "GE Vernova Inc.", exchange: "NYSE" },
  { ticker: "VRT", name: "Vertiv Holdings Co", exchange: "NYSE" },
  { ticker: "ETN", name: "Eaton Corporation", exchange: "NYSE" },
];

function series(base: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date();
  for (let i = 180; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const drift = base * (1 + i * -0.0008);
    const wave = Math.sin(i / 8) * (base * 0.015);
    const close = Number((drift + wave).toFixed(2));
    points.push({ date: date.toISOString().slice(0, 10), close, volume: 10_000_000 + i * 10000 });
  }
  return points;
}

const byTicker: Record<string, { quote: Quote; fundamentals: Fundamentals; base: number }> = {
  NVDA: {
    quote: {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      price: 134.5,
      changePercent: 1.3,
      marketCap: 3_300_000_000_000,
      sector: "Technology",
      industry: "Semiconductors",
    },
    fundamentals: {
      epsForward: 3.95,
      epsGrowth: 28,
      revenueGrowth: 24,
      fcf: 61_000_000_000,
      sharesOutstanding: 24_600_000_000,
      ebitda: 80_000_000_000,
      netDebt: -20_000_000_000,
    },
    base: 110,
  },
  MSFT: {
    quote: {
      ticker: "MSFT",
      name: "Microsoft Corporation",
      price: 462.2,
      changePercent: -0.4,
      marketCap: 3_430_000_000_000,
      sector: "Technology",
      industry: "Software",
    },
    fundamentals: {
      epsForward: 14.3,
      epsGrowth: 14,
      revenueGrowth: 13,
      fcf: 85_000_000_000,
      sharesOutstanding: 7_430_000_000,
      ebitda: 140_000_000_000,
      netDebt: -65_000_000_000,
    },
    base: 410,
  },
  GEV: {
    quote: {
      ticker: "GEV",
      name: "GE Vernova Inc.",
      price: 347.0,
      changePercent: 0.9,
      marketCap: 95_000_000_000,
      sector: "Industrials",
      industry: "Power Equipment",
    },
    fundamentals: {
      epsForward: 8.7,
      epsGrowth: 36,
      revenueGrowth: 18,
      fcf: 3_100_000_000,
      sharesOutstanding: 274_000_000,
      ebitda: 5_300_000_000,
      netDebt: 2_000_000_000,
    },
    base: 280,
  },
};

export class MockProvider implements MarketDataProvider {
  async searchTickers(query: string): Promise<SearchResult[]> {
    if (!query) return mockUniverse;
    const q = query.toUpperCase();
    return mockUniverse.filter((row) => row.ticker.includes(q) || row.name.toUpperCase().includes(q));
  }

  async getQuote(ticker: string): Promise<Quote> {
    const found = byTicker[ticker.toUpperCase()] ?? byTicker.NVDA;
    return found.quote;
  }

  async getHistory(ticker: string, _range: "1M" | "3M" | "6M" | "1Y" = "1Y"): Promise<PricePoint[]> {
    const found = byTicker[ticker.toUpperCase()] ?? byTicker.NVDA;
    return series(found.base);
  }

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    const found = byTicker[ticker.toUpperCase()] ?? byTicker.NVDA;
    return found.fundamentals;
  }
}
