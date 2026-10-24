import {
  ArrowDownRight,
  ArrowUpRight,
  MessageSquareQuote,
  Star,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Kpis } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface Delta {
  direction: "up" | "down";
  text: string;
}

function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  hint,
  delta,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: LucideIcon;
  hint: string;
  delta?: Delta | null;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-label text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 text-primary/70" strokeWidth={1.8} aria-hidden="true" />
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-[34px] font-semibold leading-none tracking-tight">
          {value}
        </span>
        {suffix ? (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
              delta.direction === "up"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
            )}
            {delta.text}
          </span>
        ) : null}
        <span className="text-muted-foreground">{hint}</span>
      </div>
    </Card>
  );
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const averageDelta: Delta | null =
    kpis.averageDelta === null
      ? null
      : {
          direction: kpis.averageDelta >= 0 ? "up" : "down",
          text: `${kpis.averageDelta > 0 ? "+" : ""}${kpis.averageDelta.toFixed(2)}`,
        };

  const volumeDelta: Delta | null =
    kpis.volumeDelta === null
      ? null
      : {
          direction: kpis.volumeDelta >= 0 ? "up" : "down",
          text: `${kpis.volumeDelta > 0 ? "+" : ""}${kpis.volumeDelta}`,
        };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Average rating"
        value={kpis.total ? kpis.averageRating.toFixed(2) : "—"}
        suffix="/ 5"
        icon={Star}
        hint="vs previous period"
        delta={averageDelta}
      />
      <KpiCard
        label="Responses"
        value={String(kpis.total)}
        icon={MessageSquareQuote}
        hint="vs previous period"
        delta={volumeDelta}
      />
      <KpiCard
        label="Net promoter score"
        value={kpis.nps === null ? "—" : String(kpis.nps)}
        icon={ThumbsUp}
        hint={`${kpis.promoters} promoters · ${kpis.detractors} detractors`}
      />
      <KpiCard
        label="Response rate"
        value={`${Math.round(kpis.responseRate)}%`}
        icon={Users}
        hint={`of ${kpis.invitations} QR scans`}
      />
    </div>
  );
}
