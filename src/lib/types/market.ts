export type PricePoint = {
  date: string;
  close: number;
  volume: number;
};

export type Quote = {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number;
  sector: string;
  industry: string;
};

export type Fundamentals = {
  epsForward: number;
  epsGrowth: number;
  revenueGrowth: number;
  fcf: number;
  sharesOutstanding: number;
  ebitda: number;
  netDebt: number;
};

export type SearchResult = {
  ticker: string;
  name: string;
  exchange: string;
};

export type StockSnapshot = {
  quote: Quote;
  history: PricePoint[];
  relativeHistory: PricePoint[];
  fundamentals: Fundamentals;
  lastUpdated: string;
};
