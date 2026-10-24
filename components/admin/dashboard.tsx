"use client";

import { Download, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { CategoryBreakdown } from "@/components/admin/category-breakdown";
import { GuestLinkCard } from "@/components/admin/guest-link-card";
import { KpiCards } from "@/components/admin/kpi-cards";
import { NpsPanel } from "@/components/admin/nps-panel";
import { PropertyPerformance } from "@/components/admin/property-performance";
import { RatingDistribution } from "@/components/admin/rating-distribution";
import { RatingTrendChart } from "@/components/admin/rating-trend-chart";
import { ResponsesTable } from "@/components/admin/responses-table";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RANGE_OPTIONS,
  buildDashboard,
  filterByRange,
  invitationsInRange,
  type RangeKey,
} from "@/lib/analytics";
import { downloadCsv, entriesToCsv } from "@/lib/csv";
import {
  DEFAULT_PROPERTY,
  getPropertyById,
  invitationsFor,
  PROPERTIES,
} from "@/lib/properties";
import { repository } from "@/lib/repository";
import type { FeedbackEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "focus-ring h-9 rounded-full border border-input bg-card px-3.5 text-[13px] font-medium text-foreground";

export function Dashboard() {
  const [entries, setEntries] = React.useState<FeedbackEntry[] | null>(null);
  const [range, setRange] = React.useState<RangeKey>("30d");
  const [propertyId, setPropertyId] = React.useState("all");
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async (announce = false) => {
    setRefreshing(true);
    try {
      const data = await repository.list();
      setEntries(data);
      if (announce) toast.success("Dashboard refreshed.");
    } catch (error) {
      console.error("StayFeedback: failed to load entries.", error);
      toast.error("Could not load feedback.");
      setEntries([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const propertyEntries = React.useMemo(() => {
    if (!entries) return [];
    return propertyId === "all"
      ? entries
      : entries.filter((entry) => entry.propertyId === propertyId);
  }, [entries, propertyId]);

  const invitations = React.useMemo(
    () =>
      invitationsInRange(
        invitationsFor(propertyId === "all" ? [] : [propertyId]),
        range,
      ),
    [propertyId, range],
  );

  const dashboard = React.useMemo(
    () => buildDashboard(propertyEntries, invitations, range),
    [propertyEntries, invitations, range],
  );

  const rangeEntries = React.useMemo(
    () => filterByRange(propertyEntries, range),
    [propertyEntries, range],
  );

  const activeProperty = React.useMemo(
    () =>
      propertyId === "all"
        ? DEFAULT_PROPERTY
        : getPropertyById(propertyId) ?? DEFAULT_PROPERTY,
    [propertyId],
  );

  const rangeLabel =
    RANGE_OPTIONS.find((option) => option.key === range)?.label ?? "Last 30 days";

  function handleExport() {
    if (rangeEntries.length === 0) {
      toast.error("There is nothing to export in this period.");
      return;
    }

    const scope = propertyId === "all" ? "all-properties" : activeProperty.code;
    downloadCsv(
      `stayfeedback-${scope}-${range}.csv`,
      entriesToCsv(rangeEntries),
    );
    toast.success(`Exported ${rangeEntries.length} responses.`);
  }

  async function handleSeed() {
    await repository.seed();
    await load();
    toast.success("Demo data restored.");
  }

  if (!entries) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="container flex-1 py-10">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-3 h-4 w-80" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-[132px] rounded-lg" />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-[340px] rounded-lg lg:col-span-2" />
            <Skeleton className="h-[340px] rounded-lg" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="container flex-1 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Staff view</p>
            <h1 className="mt-2 text-3xl sm:text-4xl">Guest insights</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {propertyId === "all"
                ? "All properties"
                : `${activeProperty.name} · ${activeProperty.city}`}
              {" · "}
              {rangeLabel} · {rangeEntries.length}{" "}
              {rangeEntries.length === 1 ? "response" : "responses"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="property-filter">
              Property
            </label>
            <select
              id="property-filter"
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              className={SELECT_CLASS}
            >
              <option value="all">All properties</option>
              {PROPERTIES.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="range-filter">
              Date range
            </label>
            <select
              id="range-filter"
              value={range}
              onChange={(event) => setRange(event.target.value as RangeKey)}
              className={SELECT_CLASS}
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button type="button" variant="outline" size="sm" onClick={handleExport}>
              <Download aria-hidden="true" />
              Export CSV
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void load(true)}
              aria-label="Refresh data"
              disabled={refreshing}
            >
              <RefreshCw
                className={cn(refreshing && "animate-spin")}
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl">No feedback yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Load the demo responses to explore the dashboard, or send the guest
              form to a real visitor.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => void handleSeed()}>
                Load demo data
              </Button>
              <Button asChild variant="outline">
                <Link href="/feedback">Open guest form</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <KpiCards kpis={dashboard.kpis} />

            <PropertyPerformance
              entries={entries}
              range={range}
              propertyId={propertyId}
              onSelect={setPropertyId}
            />

            <GuestLinkCard
              property={activeProperty}
              isFallback={propertyId === "all"}
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RatingTrendChart data={dashboard.trend} />
              </div>
              <NpsPanel nps={dashboard.nps} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <CategoryBreakdown data={dashboard.categories} />
              <RatingDistribution data={dashboard.distribution} />
            </div>

            <ResponsesTable
              key={`${propertyId}-${range}`}
              entries={rangeEntries}
              showProperty={propertyId === "all"}
            />

            <p className="pb-2 text-center text-xs text-muted-foreground">
              Demo data lives in this browser.{" "}
              <Link
                href="/feedback"
                className="font-medium underline underline-offset-4 hover:text-foreground"
              >
                Submit a response
              </Link>{" "}
              and refresh to watch it appear.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
