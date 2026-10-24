"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import type { CategoryPoint } from "@/lib/analytics";
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

export function CategoryBreakdown({ data }: { data: CategoryPoint[] }) {
  const hasData = data.some((category) => category.score > 0);

  return (
    <Card className="p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold">Category scores</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Where the stay felt strong, and where it slipped
        </p>
      </div>

      <div className="mt-4 h-[236px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 28, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 5]} hide />
              <YAxis
                type="category"
                dataKey="label"
                width={92}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#78716c", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: CHART_COLORS.grid }}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{
                  color: "hsl(var(--muted-foreground))",
                  fontSize: 11,
                  marginBottom: 2,
                }}
                formatter={(value) => [
                  `${Number(value).toFixed(2)} / 5`,
                  "Average score",
                ]}
              />
              <Bar
                dataKey="score"
                barSize={14}
                radius={4}
                background={{ fill: CHART_COLORS.grid }}
                animationDuration={500}
              >
                {data.map((category) => (
                  <Cell
                    key={category.key}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.35 + category.score / 12}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Category ratings will appear here.
          </div>
        )}
      </div>
    </Card>
  );
}
