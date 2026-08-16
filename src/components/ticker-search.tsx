"use client";

import { useEffect, useState } from "react";

type SearchResult = { ticker: string; name: string; exchange: string };

export function TickerSearch({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/stocks/search?query=${encodeURIComponent(query)}`);
      const payload = (await res.json()) as { data: SearchResult[] };
      setResults(payload.data.slice(0, 5));
    };

    const id = setTimeout(run, 200);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ticker (e.g., NVDA)"
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
      />
      <div className="mt-2 space-y-1">
        {results.map((row) => (
          <button
            key={row.ticker}
            type="button"
            onClick={() => onSelect(row.ticker)}
            className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <span className="font-semibold">{row.ticker}</span>
            <span className="truncate text-zinc-500">{row.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
