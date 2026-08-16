"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SearchResult = { ticker: string; name: string };

export function TickerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const id = setTimeout(async () => {
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      const json = (await res.json()) as { results: SearchResult[] };
      setResults(json.results);
    }, 250);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search ticker (e.g. NVDA)"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
      />
      {query.trim().length > 0 && results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950">
          {results.map((result) => (
            <Link
              key={result.ticker}
              href={`/stocks/${result.ticker}`}
              className="block border-b border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-900"
            >
              <div className="font-semibold text-zinc-100">{result.ticker}</div>
              <div className="text-xs text-zinc-400">{result.name}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
