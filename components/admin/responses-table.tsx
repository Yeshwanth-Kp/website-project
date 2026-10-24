"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/lib/format";
import type { FeedbackEntry } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const PAGE_SIZE = 8;

const RATING_FILTERS = ["all", "5", "4", "3", "2", "1"] as const;
type RatingFilter = (typeof RATING_FILTERS)[number];

export function ResponsesTable({ entries }: { entries: FeedbackEntry[] }) {
  const [query, setQuery] = React.useState("");
  const [rating, setRating] = React.useState<RatingFilter>("all");
  const [visible, setVisible] = React.useState(PAGE_SIZE);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();

    return entries.filter((entry) => {
      if (rating !== "all" && entry.overallRating !== Number(rating)) return false;
      if (!needle) return true;

      const haystack = [
        entry.guestName ?? "",
        entry.roomNumber ?? "",
        entry.comment,
        entry.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [entries, query, rating]);

  React.useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, rating]);

  const shown = filtered.slice(0, visible);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 className="text-base font-semibold">Recent responses</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {filtered.length} of {entries.length} notes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guest, room or note"
              aria-label="Search responses"
              className="h-9 w-full rounded-full pl-9 text-[13px] sm:w-60"
            />
          </div>

          <div
            className="flex items-center gap-0.5 rounded-full border border-border p-0.5"
            role="group"
            aria-label="Filter by rating"
          >
            {RATING_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={rating === option}
                onClick={() => setRating(option)}
                className={cn(
                  "focus-ring rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  rating === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "all" ? "All" : `${option}★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-label text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">Guest</th>
              <th scope="col" className="px-3 py-3 font-semibold">Rating</th>
              <th scope="col" className="px-3 py-3 font-semibold">Comment</th>
              <th scope="col" className="px-3 py-3 font-semibold">Tags</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  No responses match those filters.
                </td>
              </tr>
            ) : (
              shown.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                        {initials(entry.guestName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {entry.guestName ?? "Anonymous guest"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.roomNumber ?? "No room given"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Stars value={entry.overallRating} size="xs" />
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {entry.overallRating}.0
                      </span>
                    </div>
                  </td>

                  <td className="max-w-[340px] px-3 py-3.5">
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                      {entry.comment}
                    </p>
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="flex max-w-[180px] flex-wrap gap-1">
                      {entry.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 2 ? (
                        <Badge variant="outline">+{entry.tags.length - 2}</Badge>
                      ) : null}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs text-muted-foreground">
                    {formatShortDate(entry.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > shown.length ? (
        <div className="flex justify-center border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
          >
            Show {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
