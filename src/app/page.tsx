import { StockDashboard } from "@/components/stock-dashboard";
import { WatchlistTable } from "@/components/watchlist-table";

export default function Home() {
  const defaultTicker = process.env.NEXT_PUBLIC_DEFAULT_TICKER ?? "NVDA";

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-4">
      <header className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h1 className="text-2xl font-bold">A-Stocks Tactical Investing Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Evidence-first tactical framework. Decision support only, not investment advice.
        </p>
      </header>

      <StockDashboard initialTicker={defaultTicker} />
      <WatchlistTable />
    </main>
  );
}
