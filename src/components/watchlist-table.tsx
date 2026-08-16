"use client";

import { useEffect, useState } from "react";

type Row = {
  ticker: string;
  price: number;
  tacticalScore: number;
  tacticalRating: string;
  valuationStatus: string;
  rsi: number | null;
};

export function WatchlistTable() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = async () => {
      const wlRes = await fetch("/api/watchlist");
      const wl = (await wlRes.json()) as { data: string[] };
      const snapshots = await Promise.all(
        wl.data.map(async (ticker) => {
          const res = await fetch(`/api/stocks/${ticker}/snapshot`);
          const payload = (await res.json()) as { data: any };
          return {
            ticker,
            price: payload.data.quote.price,
            tacticalScore: payload.data.tactical.score,
            tacticalRating: payload.data.tactical.rating,
            valuationStatus: payload.data.valuation.status,
            rsi: payload.data.technicals.rsi14,
          } satisfies Row;
        }),
      );
      setRows(snapshots.sort((a, b) => b.tacticalScore - a.tacticalScore));
    };
    load();
  }, []);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <h3 className="mb-2 text-sm font-semibold text-zinc-100">Watchlist</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="text-zinc-500">
            <tr>
              <th>Ticker</th><th>Price</th><th>Score</th><th>Rating</th><th>Valuation</th><th>RSI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.ticker} className="border-t border-zinc-800">
                <td className="py-1 font-semibold">{row.ticker}</td>
                <td>${row.price.toFixed(2)}</td>
                <td>{row.tacticalScore}</td>
                <td>{row.tacticalRating}</td>
                <td>{row.valuationStatus}</td>
                <td>{row.rsi ? row.rsi.toFixed(1) : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
