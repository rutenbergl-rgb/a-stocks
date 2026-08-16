export type TacticalWeights = {
  earningsRevisions: number;
  fundamentals: number;
  relativeStrength: number;
  technicalTrend: number;
  valuation: number;
  sectorStrength: number;
  fcfQuality: number;
  riskReward: number;
};

export const defaultTacticalWeights: TacticalWeights = {
  earningsRevisions: 20,
  fundamentals: 15,
  relativeStrength: 15,
  technicalTrend: 15,
  valuation: 15,
  sectorStrength: 10,
  fcfQuality: 5,
  riskReward: 5,
};

export type TacticalComponents = {
  earningsRevisions: number;
  fundamentals: number;
  relativeStrength: number;
  technicalTrend: number;
  valuation: number;
  sectorStrength: number;
  fcfQuality: number;
  riskReward: number;
};

export function tacticalScore(
  components: TacticalComponents,
  weights: TacticalWeights = defaultTacticalWeights,
): number {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weighted =
    components.earningsRevisions * weights.earningsRevisions +
    components.fundamentals * weights.fundamentals +
    components.relativeStrength * weights.relativeStrength +
    components.technicalTrend * weights.technicalTrend +
    components.valuation * weights.valuation +
    components.sectorStrength * weights.sectorStrength +
    components.fcfQuality * weights.fcfQuality +
    components.riskReward * weights.riskReward;

  return Number((weighted / totalWeight).toFixed(1));
}

export function tacticalRating(score: number): string {
  if (score >= 80) return "🟢 ACCUMULATE";
  if (score >= 65) return "🔵 HOLD";
  if (score >= 50) return "🟡 TRIM";
  if (score >= 35) return "🟠 WATCH / WAIT";
  return "🔴 AVOID";
}
