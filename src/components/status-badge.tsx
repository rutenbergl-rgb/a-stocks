import { TacticalRating } from "@/lib/types";

const ratingStyles: Record<TacticalRating, string> = {
  ACCUMULATE: "bg-emerald-500/20 text-emerald-300",
  HOLD: "bg-sky-500/20 text-sky-300",
  TRIM: "bg-amber-500/20 text-amber-300",
  "WATCH / WAIT": "bg-orange-500/20 text-orange-300",
  AVOID: "bg-rose-500/20 text-rose-300",
};

export function StatusBadge({ rating }: { rating: TacticalRating }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ratingStyles[rating]}`}>
      {rating}
    </span>
  );
}
