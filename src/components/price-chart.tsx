"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; close: number };

export function PriceChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip />
          <Line dot={false} type="monotone" dataKey="close" stroke="#22d3ee" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
