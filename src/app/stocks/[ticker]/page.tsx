import { PriceChart } from "@/components/price-chart";
import { StatusBadge } from "@/components/status-badge";
import { getStockSnapshot } from "@/lib/services/stock-service";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function maybePercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "Data unavailable";
  return `${value.toFixed(2)}%`;
}

export default async function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const snapshot = await getStockSnapshot(ticker);

  const reasons = [
    snapshot.indicators.rs3m && snapshot.indicators.rs3m > 0
      ? "Relative strength vs SPY is improving"
      : "Relative strength vs SPY is softening",
    snapshot.indicators.ma50 && snapshot.quote.price > snapshot.indicators.ma50
      ? "Price is above 50-day moving average"
      : "Price is below 50-day moving average",
    snapshot.valuation.valuationStatus === "Modestly Expensive"
      ? "Valuation is above base fair value"
      : "Valuation is near fair value range",
  ];

  return (
    <main className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-4">
        <div>
          <div className="text-3xl font-bold">{snapshot.quote.ticker}</div>
          <div className="text-sm text-zinc-400">{snapshot.quote.name}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-zinc-400">Price</div>
          <div className="text-2xl font-semibold">{currency.format(snapshot.quote.price)}</div>
          <div className={snapshot.quote.changePct >= 0 ? "text-emerald-300" : "text-rose-300"}>
            {snapshot.quote.changePct.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs uppercase text-zinc-400">Tactical score</div>
          <div className="text-2xl font-semibold">{snapshot.tactical.score} / 100</div>
          <div className="mt-2">
            <StatusBadge rating={snapshot.tactical.rating} />
          </div>
        </div>
        <div>
          <div className="text-xs uppercase text-zinc-400">Valuation</div>
          <div className="text-lg font-semibold">{snapshot.valuation.valuationStatus}</div>
          <div className="text-xs text-zinc-400">Confidence: {snapshot.tactical.confidence}</div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-3 text-lg font-semibold">Price Trend (1Y)</h2>
        <PriceChart data={snapshot.history} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase text-zinc-400">Technical + Relative Strength</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-zinc-400">20-day MA</dt>
            <dd>{snapshot.indicators.ma20 ? currency.format(snapshot.indicators.ma20) : "Data unavailable"}</dd>
            <dt className="text-zinc-400">50-day MA</dt>
            <dd>{snapshot.indicators.ma50 ? currency.format(snapshot.indicators.ma50) : "Data unavailable"}</dd>
            <dt className="text-zinc-400">200-day MA</dt>
            <dd>{snapshot.indicators.ma200 ? currency.format(snapshot.indicators.ma200) : "Data unavailable"}</dd>
            <dt className="text-zinc-400">RSI (14)</dt>
            <dd>{maybePercent(snapshot.indicators.rsi)}</dd>
            <dt className="text-zinc-400">Rel Strength vs SPY (3M)</dt>
            <dd>{maybePercent(snapshot.indicators.rs3m)}</dd>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase text-zinc-400">Valuation + Fair Value</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-zinc-400">Forward P/E</dt>
            <dd>{snapshot.indicators.forwardPe ? snapshot.indicators.forwardPe.toFixed(1) : "N/M"}</dd>
            <dt className="text-zinc-400">PEG</dt>
            <dd>{snapshot.indicators.peg ? snapshot.indicators.peg.toFixed(2) : "Data unavailable"}</dd>
            <dt className="text-zinc-400">FCF Yield</dt>
            <dd>{maybePercent(snapshot.indicators.cashFlowYield)}</dd>
            <dt className="text-zinc-400">Fair Value (Base, P/E)</dt>
            <dd>
              {snapshot.valuation.peFair?.base
                ? currency.format(snapshot.valuation.peFair.base)
                : "Data unavailable"}
            </dd>
            <dt className="text-zinc-400">DCF Base Value</dt>
            <dd>{currency.format(snapshot.valuation.dcfFairValue)}</dd>
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase text-zinc-400">Tactical Rating Evidence</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
