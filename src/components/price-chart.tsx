"use client";

import { PriceBar } from "@/lib/types";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PriceChart({ data }: { data: PriceBar[] }) {
  const rows = data.map((bar) => ({
    date: new Date(bar.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    close: Number(bar.close.toFixed(2)),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={rows}>
          <XAxis dataKey="date" hide />
          <YAxis domain={["auto", "auto"]} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <Tooltip />
          <Line dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
