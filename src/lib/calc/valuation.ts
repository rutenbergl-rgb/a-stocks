export function pegRatio(forwardPe: number, epsGrowthPct: number): number | null {
  if (epsGrowthPct <= 0) return null;
  return forwardPe / epsGrowthPct;
}

export function fcfYield(fcf: number, marketCap: number): number | null {
  if (marketCap <= 0) return null;
  return (fcf / marketCap) * 100;
}

export function forwardPE(price: number, epsForward: number): number | null {
  if (epsForward <= 0) return null;
  return price / epsForward;
}

export function fairValueFromPE(eps: number, multiple: number): number {
  return eps * multiple;
}

export type DcfInput = {
  revenue: number;
  growthRates: number[];
  operatingMargin: number;
  taxRate: number;
  fcfConversion: number;
  discountRate: number;
  terminalGrowth: number;
  sharesOutstanding: number;
  netDebt: number;
};

export function dcfValuePerShare(input: DcfInput): number {
  let revenue = input.revenue;
  let pv = 0;

  for (let year = 0; year < input.growthRates.length; year += 1) {
    revenue *= 1 + input.growthRates[year];
    const ebit = revenue * input.operatingMargin;
    const nopat = ebit * (1 - input.taxRate);
    const fcf = nopat * input.fcfConversion;
    pv += fcf / (1 + input.discountRate) ** (year + 1);
  }

  const finalYearFcf =
    revenue * input.operatingMargin * (1 - input.taxRate) * input.fcfConversion;
  const terminalValue =
    (finalYearFcf * (1 + input.terminalGrowth)) /
    (input.discountRate - input.terminalGrowth);

  const pvTerminal =
    terminalValue / (1 + input.discountRate) ** input.growthRates.length;
  const equityValue = pv + pvTerminal - input.netDebt;

  return equityValue / input.sharesOutstanding;
}

export function reverseDcfImpliedGrowth(
  price: number,
  revenue: number,
  operatingMargin: number,
  taxRate: number,
  fcfConversion: number,
  discountRate: number,
  terminalGrowth: number,
  years: number,
  sharesOutstanding: number,
  netDebt: number,
): number {
  const targetEquity = price * sharesOutstanding + netDebt;

  let low = -0.2;
  let high = 0.6;

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const growthRates = Array.from({ length: years }, () => mid);
    const value = dcfValuePerShare({
      revenue,
      growthRates,
      operatingMargin,
      taxRate,
      fcfConversion,
      discountRate,
      terminalGrowth,
      sharesOutstanding,
      netDebt,
    });
    const impliedEquity = value * sharesOutstanding + netDebt;

    if (impliedEquity > targetEquity) high = mid;
    else low = mid;
  }

  return ((low + high) / 2) * 100;
}
