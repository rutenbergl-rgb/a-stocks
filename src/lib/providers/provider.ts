import type {
  Fundamentals,
  PricePoint,
  Quote,
  SearchResult,
} from "@/lib/types/market";

export interface MarketDataProvider {
  searchTickers(query: string): Promise<SearchResult[]>;
  getQuote(ticker: string): Promise<Quote>;
  getHistory(ticker: string, range: "1M" | "3M" | "6M" | "1Y"): Promise<PricePoint[]>;
  getFundamentals(ticker: string): Promise<Fundamentals>;
}
