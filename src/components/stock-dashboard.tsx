"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { PriceChart } from "@/components/price-chart";
import { TickerSearch } from "@/components/ticker-search";

type Snapshot = any;

function fmtPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${value.toFixed(1)}%`;
}

export function StockDashboard({ initialTicker }: { initialTicker: string }) {
  const [ticker, setTicker] = useState(initialTicker);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/stocks/${ticker}/snapshot`);
      const payload = (await res.json()) as { data: Snapshot };
      setSnapshot(payload.data);
      setLoading(false);
    };
    load();
  }, [ticker]);

  if (!snapshot) return <div className="text-zinc-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1"><TickerSearch onSelect={setTicker} /></div>
        <div className="grid gap-3 lg:col-span-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Ticker" value={snapshot.quote.ticker} hint={snapshot.quote.name} />
          <MetricCard label="Price" value={`$${snapshot.quote.price.toFixed(2)}`} hint={`${snapshot.quote.changePercent.toFixed(2)}% today`} />
          <MetricCard label="Tactical Rating" value={snapshot.tactical.rating} hint={`${snapshot.tactical.confidence} confidence`} />
          <MetricCard label="Tactical Score" value={`${snapshot.tactical.score} / 100`} hint="Explainable score" />
        </div>
      </div>

      <PriceChart data={snapshot.history} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="MA 20 / 50 / 200" value={`${snapshot.technicals.ma20?.toFixed(2)} / ${snapshot.technicals.ma50?.toFixed(2)} / ${snapshot.technicals.ma200?.toFixed(2)}`} />
        <MetricCard label="RSI 14" value={snapshot.technicals.rsi14 ? snapshot.technicals.rsi14.toFixed(1) : "N/A"} hint="Never used alone" />
        <MetricCard label="Valuation" value={snapshot.valuation.status} hint={`Fwd P/E: ${snapshot.valuation.forwardPE ? snapshot.valuation.forwardPE.toFixed(1) : "N/M"}`} />
        <MetricCard label="Fair Value" value={`$${snapshot.fairValue.bear} / $${snapshot.fairValue.base} / $${snapshot.fairValue.bull}`} hint="Bear / Base / Bull" />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">
        <div className="font-semibold text-zinc-100">Score Breakdown</div>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {Object.entries(snapshot.tactical.components).map(([k, v]) => (
            <li key={k} className="flex justify-between border-b border-zinc-800 py-1">
              <span>{k}</span><span>{String(v)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">
        <div className="font-semibold text-zinc-100">What changed focus</div>
        <ul className="mt-2 list-disc pl-5">
          <li>Price vs 50DMA: {fmtPercent(snapshot.technicals.percentFromMa50)}</li>
          <li>Price vs 200DMA: {fmtPercent(snapshot.technicals.percentFromMa200)}</li>
          <li>Implied growth at current price (Reverse DCF): {snapshot.fairValue.impliedGrowth.toFixed(1)}%</li>
        </ul>
      </div>

      {loading ? <div className="text-zinc-500">Refreshing...</div> : null}
    </div>
  );
}
