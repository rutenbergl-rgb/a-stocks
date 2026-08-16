import type { MarketDataProvider } from "@/lib/providers/provider";
import { FmpProvider } from "@/lib/providers/fmp-provider";
import { MockProvider } from "@/lib/providers/mock-provider";

let provider: MarketDataProvider | null = null;

export function getProvider(): MarketDataProvider {
  if (provider) return provider;
  provider = process.env.DATA_PROVIDER === "fmp" ? new FmpProvider() : new MockProvider();
  return provider;
}
