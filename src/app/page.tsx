import { TickerSearch } from "@/components/ticker-search";
import { getMarketRegimeSnapshot } from "@/lib/services/stock-service";

export default async function Home() {
  const market = await getMarketRegimeSnapshot();

  return (
    <main className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">What should I pay attention to today?</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
          <li>Monitor breadth versus index trend to confirm participation.</li>
          <li>Prioritize stocks with improving revisions and healthy pullbacks.</li>
          <li>Avoid chasing if valuation is stretched above fair-value base case.</li>
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 md:col-span-2">
          <div className="text-xs uppercase text-zinc-400">Current Market Regime</div>
          <h1 className="mt-1 text-2xl font-bold">{market.regime}</h1>
          <p className="mt-2 text-sm text-zinc-300">{market.explanation}</p>
          <div className="mt-3 text-sm">
            Market Regime Score: <span className="font-semibold">{market.score} / 100</span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-xs uppercase text-zinc-400">Ticker Search</div>
          <div className="mt-2">
            <TickerSearch />
          </div>
        </div>
      </section>
    </main>
  );
}
