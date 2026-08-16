import type { PricePoint } from "@/lib/types/market";

export function movingAverage(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null;
  const slice = values.slice(-period);
  return slice.reduce((sum, value) => sum + value, 0) / period;
}

export function rsi(values: number[], period = 14): number | null {
  if (values.length <= period) return null;
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function relativeStrength(stockReturns: number, benchmarkReturns: number): number {
  return stockReturns - benchmarkReturns;
}

export function percentFromMA(price: number, ma: number | null): number | null {
  if (!ma || ma === 0) return null;
  return ((price - ma) / ma) * 100;
}

export function maxDrawdown(points: PricePoint[]): number {
  let peak = Number.NEGATIVE_INFINITY;
  let drawdown = 0;
  for (const point of points) {
    peak = Math.max(peak, point.close);
    const currentDrawdown = ((point.close - peak) / peak) * 100;
    drawdown = Math.min(drawdown, currentDrawdown);
  }
  return drawdown;
}
