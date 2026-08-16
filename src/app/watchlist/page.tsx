"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const defaultRows = (process.env.NEXT_PUBLIC_DEFAULT_TICKERS ?? "GEV,VRT,ETN,NVDA,MSFT")
  .split(",")
  .map((ticker) => ticker.trim())
  .filter(Boolean);

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  const [tickers, setTickers] = useState(defaultRows);

  const filtered = useMemo(() => {
    if (!query) return tickers;
    return tickers.filter((ticker) => ticker.includes(query.toUpperCase()));
  }, [query, tickers]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Watchlist</h1>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter ticker"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            const t = query.toUpperCase().trim();
            if (t && !tickers.includes(t)) setTickers((prev) => [...prev, t]);
          }}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold"
        >
          Add
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80 text-left text-zinc-400">
            <tr>
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Open</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticker) => (
              <tr key={ticker} className="border-t border-zinc-800">
                <td className="px-3 py-2 font-semibold">
                  <Link href={`/stocks/${ticker}`} className="hover:text-blue-300">
                    {ticker}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Link href={`/stocks/${ticker}`} className="text-zinc-400 hover:text-zinc-100">
                    View dashboard
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
