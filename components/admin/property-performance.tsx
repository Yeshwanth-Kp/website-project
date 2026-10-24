"use client";

import { ArrowUpRight } from "lucide-react";
import * as React from "react";

import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buildPropertyPerformance, type RangeKey } from "@/lib/analytics";
import { PROPERTIES } from "@/lib/properties";
import type { FeedbackEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PropertyPerformanceProps {
  entries: FeedbackEntry[];
  range: RangeKey;
  propertyId: string;
  onSelect: (propertyId: string) => void;
}

export function PropertyPerformance({
  entries,
  range,
  propertyId,
  onSelect,
}: PropertyPerformanceProps) {
  const rows = React.useMemo(
    () => buildPropertyPerformance(entries, PROPERTIES, range),
    [entries, range],
  );
  const total = rows.reduce((sum, row) => sum + row.responses, 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="text-base font-semibold">Property performance</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Select a property to scope every chart and response below.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground sm:hidden">
            Swipe sideways to compare every column.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline">
            {total} {total === 1 ? "response" : "responses"}
          </Badge>
          {propertyId !== "all" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelect("all")}
            >
              Show all
            </Button>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-label text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">
                Property
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Responses
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Avg rating
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                NPS
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Response rate
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Needs a look
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const active = row.property.id === propertyId;

              return (
                <tr
                  key={row.property.id}
                  className={cn(
                    "border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40",
                    active && "bg-accent/40 hover:bg-accent/50",
                  )}
                >
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => onSelect(row.property.id)}
                      aria-pressed={active}
                      aria-label={`${
                        active ? "Showing" : "Show"
                      } feedback for ${row.property.name}`}
                      className="focus-ring group flex w-full items-center justify-between gap-3 rounded text-left"
                    >
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2 font-medium">
                          {row.property.name}
                          {active ? <Badge>Viewing</Badge> : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {row.property.city}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      />
                    </button>
                  </td>

                  <td className="px-3 py-3.5">
                    <span className="font-medium tabular-nums">{row.responses}</span>
                    <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                      {Math.round(row.share * 100)}%
                    </span>
                  </td>

                  <td className="px-3 py-3.5">
                    {row.responses > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Stars value={row.averageRating} rounded size="xs" />
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                          {row.averageRating.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3.5 text-sm font-medium tabular-nums">
                    {row.nps === null ? "—" : row.nps}
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={row.responseRate}
                        className="w-16"
                        aria-label={`${Math.round(row.responseRate)}% response rate`}
                      />
                      <span className="w-9 text-xs tabular-nums text-muted-foreground">
                        {Math.round(row.responseRate)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    {row.attention > 0 ? (
                      <Badge variant="destructive">
                        {row.attention} to review
                      </Badge>
                    ) : (
                      <Badge variant="success">Clear</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
