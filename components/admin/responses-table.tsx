"use client";

import { ChevronRight, Search } from "lucide-react";
import * as React from "react";

import { ResponseDetail } from "@/components/admin/response-detail";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/lib/format";
import { SENTIMENT_META } from "@/lib/rating";
import { PROPERTIES } from "@/lib/properties";
import type { FeedbackEntry, Sentiment } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const PAGE_SIZE = 8;

const RATING_FILTERS = ["all", "5", "4", "3", "2", "1"] as const;
type RatingFilter = (typeof RATING_FILTERS)[number];

type SentimentFilter = "all" | "attention" | Sentiment;

const SENTIMENT_OPTIONS: ReadonlyArray<{
  value: SentimentFilter;
  label: string;
}> = [
  { value: "all", label: "All moods" },
  { value: "attention", label: "Needs follow-up" },
  { value: "delighted", label: "Delighted" },
  { value: "happy", label: "Happy" },
  { value: "neutral", label: "Neutral" },
  { value: "unhappy", label: "Unhappy" },
  { value: "upset", label: "Upset" },
];

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

const SELECT_CLASS =
  "focus-ring h-8 rounded-full border border-input bg-card px-3 text-xs font-medium text-foreground";

const PROPERTY_BY_ID = new Map(PROPERTIES.map((property) => [property.id, property]));

function moodVariant(sentiment: Sentiment): "success" | "secondary" | "destructive" {
  if (sentiment === "delighted" || sentiment === "happy") return "success";
  if (sentiment === "neutral") return "secondary";
  return "destructive";
}

interface ResponsesTableProps {
  entries: FeedbackEntry[];
  /** Show which property each response belongs to when the dashboard is unscoped. */
  showProperty?: boolean;
}

export function ResponsesTable({
  entries,
  showProperty = false,
}: ResponsesTableProps) {
  const [query, setQuery] = React.useState("");
  const [rating, setRating] = React.useState<RatingFilter>("all");
  const [sentiment, setSentiment] = React.useState<SentimentFilter>("all");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [selected, setSelected] = React.useState<FeedbackEntry | null>(null);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matches = entries.filter((entry) => {
      if (rating !== "all" && entry.overallRating !== Number(rating)) return false;

      if (sentiment === "attention") {
        if (
          entry.overallRating > 3 &&
          entry.sentiment !== "unhappy" &&
          entry.sentiment !== "upset"
        ) {
          return false;
        }
      } else if (sentiment !== "all" && entry.sentiment !== sentiment) {
        return false;
      }

      if (!needle) return true;

      const property = PROPERTY_BY_ID.get(entry.propertyId);
      const haystack = [
        entry.guestName ?? "",
        entry.guestEmail ?? "",
        entry.roomNumber ?? "",
        entry.comment,
        entry.tags.join(" "),
        entry.sentiment ?? "",
        property?.name ?? "",
        property?.city ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });

    return matches.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      if (sort === "oldest") return aTime - bTime;
      if (sort === "highest") return b.overallRating - a.overallRating || bTime - aTime;
      if (sort === "lowest") return a.overallRating - b.overallRating || bTime - aTime;
      return bTime - aTime;
    });
  }, [entries, query, rating, sentiment, sort]);

  React.useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, rating, sentiment, sort]);

  const shown = filtered.slice(0, visible);
  const hasFilters =
    query.trim() !== "" || rating !== "all" || sentiment !== "all";

  function clearFilters() {
    setQuery("");
    setRating("all");
    setSentiment("all");
    setSort("newest");
  }

  const selectedPropertyName = selected
    ? PROPERTY_BY_ID.get(selected.propertyId)?.name ?? "Unknown property"
    : "";

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Guest responses</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filtered.length} of {entries.length} notes
              {hasFilters ? " · filters applied" : ""}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground sm:hidden">
              Swipe sideways to read rating, mood and notes.
            </p>
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Guest, room, property or note"
              aria-label="Search responses"
              className="h-9 w-full rounded-full pl-9 text-[13px] sm:w-64"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
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

          <label className="sr-only" htmlFor="mood-filter">
            Filter by mood
          </label>
          <select
            id="mood-filter"
            value={sentiment}
            onChange={(event) =>
              setSentiment(event.target.value as SentimentFilter)
            }
            className={SELECT_CLASS}
          >
            {SENTIMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="sort-filter">
            Sort responses
          </label>
          <select
            id="sort-filter"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className={SELECT_CLASS}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {hasFilters ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-label text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">
                Guest
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Rating
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Mood
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Comment
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Tags
              </th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                Date
              </th>
              <th scope="col" className="px-3 py-3">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  <p>No responses match those filters.</p>
                  {hasFilters ? (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </td>
              </tr>
            ) : (
              shown.map((entry) => {
                const property = PROPERTY_BY_ID.get(entry.propertyId);
                const mood = entry.sentiment
                  ? SENTIMENT_META[entry.sentiment]
                  : null;

                return (
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
                            {showProperty && property
                              ? ` · ${property.name}`
                              : ""}
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

                    <td className="px-3 py-3.5">
                      {mood && entry.sentiment ? (
                        <Badge variant={moodVariant(entry.sentiment)}>
                          <span aria-hidden="true">{mood.emoji}</span>
                          {mood.label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="max-w-[340px] px-3 py-3.5">
                      <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                        {entry.comment}
                      </p>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex max-w-[170px] flex-wrap gap-1">
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

                    <td className="whitespace-nowrap px-3 py-3.5 text-right text-xs text-muted-foreground">
                      {formatShortDate(entry.createdAt)}
                    </td>

                    <td className="px-3 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelected(entry)}
                        aria-label={`View response from ${
                          entry.guestName ?? "anonymous guest"
                        }`}
                      >
                        <ChevronRight aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">
            Showing {shown.length} of {filtered.length}
          </p>
          {filtered.length > shown.length ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setVisible((value) => value + PAGE_SIZE)}
            >
              Show {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
            </Button>
          ) : null}
        </div>
      ) : null}

      <ResponseDetail
        entry={selected}
        propertyName={selectedPropertyName}
        onClose={() => setSelected(null)}
      />
    </Card>
  );
}
