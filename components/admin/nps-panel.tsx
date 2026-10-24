import { Card } from "@/components/ui/card";
import type { NpsSummary } from "@/lib/analytics";
import { CHART_COLORS } from "@/lib/chart-colors";

export function NpsPanel({ nps }: { nps: NpsSummary }) {
  const hasData = nps.total > 0;

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold">Net promoter score</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Promoters minus detractors
        </p>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-[42px] font-semibold leading-none tracking-tight">
          {nps.score === null ? "—" : nps.score}
        </span>
        <span className="text-xs text-muted-foreground">
          {hasData ? `from ${nps.total} scores` : "no scores yet"}
        </span>
      </div>

      <div
        className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-secondary"
        role="img"
        aria-label={
          hasData
            ? `${Math.round(nps.promoterShare * 100)}% promoters, ${Math.round(
                nps.passiveShare * 100,
              )}% passives, ${Math.round(nps.detractorShare * 100)}% detractors`
            : "No NPS data"
        }
      >
        {hasData ? (
          <>
            <span
              style={{
                width: `${nps.promoterShare * 100}%`,
                backgroundColor: CHART_COLORS.success,
              }}
            />
            <span
              style={{
                width: `${nps.passiveShare * 100}%`,
                backgroundColor: CHART_COLORS.warning,
              }}
            />
            <span
              style={{
                width: `${nps.detractorShare * 100}%`,
                backgroundColor: CHART_COLORS.danger,
              }}
            />
          </>
        ) : null}
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.success }}
              aria-hidden="true"
            />
            Promoters (9–10)
          </dt>
          <dd className="font-medium tabular-nums">
            {nps.promoters}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {hasData ? `${Math.round(nps.promoterShare * 100)}%` : "0%"}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.warning }}
              aria-hidden="true"
            />
            Passives (7–8)
          </dt>
          <dd className="font-medium tabular-nums">
            {nps.passives}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {hasData ? `${Math.round(nps.passiveShare * 100)}%` : "0%"}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.danger }}
              aria-hidden="true"
            />
            Detractors (0–6)
          </dt>
          <dd className="font-medium tabular-nums">
            {nps.detractors}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {hasData ? `${Math.round(nps.detractorShare * 100)}%` : "0%"}
            </span>
          </dd>
        </div>
      </dl>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-muted-foreground">
        Anything below zero means more guests would warn a friend than recommend
        you.
      </p>
    </Card>
  );
}
