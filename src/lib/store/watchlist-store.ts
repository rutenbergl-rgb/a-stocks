const inMemoryWatchlist = new Set<string>(["NVDA", "MSFT", "GEV"]);

export function listWatchlist(): string[] {
  return Array.from(inMemoryWatchlist);
}

export function addToWatchlist(ticker: string): string[] {
  inMemoryWatchlist.add(ticker.toUpperCase());
  return listWatchlist();
}
