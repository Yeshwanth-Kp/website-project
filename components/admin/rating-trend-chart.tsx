"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import type { TrendPoint } from "@/lib/analytics";
import { CHART_COLORS } from "@/lib/chart-colors";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  boxShadow: "0 12px 32px -18px rgba(28, 25, 23, 0.35)",
  fontSize: 12,
  padding: "8px 12px",
  color: "hsl(var(--card-foreground))",
} as const;

export function RatingTrendChart({ data }: { data: TrendPoint[] }) {
  const hasData = data.some((point) => point.rating !== null);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Rating over time</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Average overall rating per period
          </p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-label text-muted-foreground">
          1–5 scale
        </span>
      </div>

      <div className="mt-5 h-[260px] w-full text-primary">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                stroke={CHART_COLORS.grid}
                strokeDasharray="3 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#78716c", fontSize: 11 }}
                dy={8}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#78716c", fontSize: 11 }}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: CHART_COLORS.grid, strokeWidth: 1 }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{
                  color: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                  marginBottom: 2,
                }}
                formatter={(value) => [
                  `${Number(value).toFixed(2)} / 5`,
                  "Average rating",
                ]}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="currentColor"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                connectNulls
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            No responses in this period yet.
          </div>
        )}
      </div>
    </Card>
  );
}
