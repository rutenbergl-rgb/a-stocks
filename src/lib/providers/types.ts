import { Fundamentals, PriceBar, Quote } from "@/lib/types";

export type DataProvider = {
  searchTickers: (query: string) => Promise<Array<{ ticker: string; name: string }>>;
  getQuote: (ticker: string) => Promise<Quote>;
  getHistory: (ticker: string, range?: "1M" | "3M" | "6M" | "1Y") => Promise<PriceBar[]>;
  getFundamentals: (ticker: string) => Promise<Fundamentals>;
};
