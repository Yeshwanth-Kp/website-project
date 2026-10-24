import { CATEGORY_META } from "./rating";
import { CATEGORY_KEYS, type CategoryKey, type FeedbackEntry } from "./types";

const DAY = 86_400_000;

export type RangeKey = "30d" | "90d" | "all";

export const RANGE_OPTIONS: ReadonlyArray<{ key: RangeKey; label: string }> = [
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export interface Kpis {
  total: number;
  averageRating: number;
  nps: number | null;
  responseRate: number;
  invitations: number;
  averageDelta: number | null;
  volumeDelta: number | null;
  promoters: number;
  passives: number;
  detractors: number;
}

export interface TrendPoint {
  label: string;
  rating: number | null;
  responses: number;
}

export interface CategoryPoint {
  key: CategoryKey;
  label: string;
  score: number;
}

export interface DistributionPoint {
  rating: number;
  count: number;
  share: number;
}

export interface NpsSummary {
  score: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
  promoterShare: number;
  passiveShare: number;
  detractorShare: number;
}

export interface DashboardData {
  kpis: Kpis;
  trend: TrendPoint[];
  categories: CategoryPoint[];
  distribution: DistributionPoint[];
  nps: NpsSummary;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function rangeDays(range: RangeKey): number | null {
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return null;
}

export function filterByRange(
  entries: FeedbackEntry[],
  range: RangeKey,
  now: number = Date.now(),
): FeedbackEntry[] {
  const days = rangeDays(range);
  if (days === null) return [...entries];
  const cutoff = now - days * DAY;
  return entries.filter((entry) => new Date(entry.createdAt).getTime() >= cutoff);
}

export function buildNps(entries: FeedbackEntry[]): NpsSummary {
  const scored = entries.filter(
    (entry) => typeof entry.nps === "number" && entry.nps >= 0 && entry.nps <= 10,
  );

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const entry of scored) {
    const score = entry.nps as number;
    if (score >= 9) promoters += 1;
    else if (score >= 7) passives += 1;
    else detractors += 1;
  }

  const total = scored.length;
  const promoterShare = total ? promoters / total : 0;
  const passiveShare = total ? passives / total : 0;
  const detractorShare = total ? detractors / total : 0;

  return {
    score: total ? Math.round((promoterShare - detractorShare) * 100) : null,
    promoters,
    passives,
    detractors,
    total,
    promoterShare,
    passiveShare,
    detractorShare,
  };
}

export function buildTrend(
  entries: FeedbackEntry[],
  range: RangeKey,
  now: number = Date.now(),
): TrendPoint[] {
  const spec =
    range === "30d"
      ? { days: 5, buckets: 6 }
      : range === "90d"
        ? { days: 7, buckets: 12 }
        : { days: 7, buckets: 12 };

  const labelFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  const points: TrendPoint[] = [];

  for (let index = spec.buckets - 1; index >= 0; index -= 1) {
    const end = now - index * spec.days * DAY;
    const start = end - spec.days * DAY;
    const inBucket = entries.filter((entry) => {
      const time = new Date(entry.createdAt).getTime();
      return time > start && time <= end;
    });

    points.push({
      label: labelFormat.format(new Date(start + (spec.days * DAY) / 2)),
      rating: inBucket.length ? Number(average(inBucket.map((entry) => entry.overallRating)).toFixed(2)) : null,
      responses: inBucket.length,
    });
  }

  return points;
}

export function buildCategoryAverages(entries: FeedbackEntry[]): CategoryPoint[] {
  return CATEGORY_META.map((category) => {
    const scores = entries
      .map((entry) => entry.categories[category.key])
      .filter((score) => typeof score === "number" && score > 0);

    return {
      key: category.key,
      label: category.label,
      score: Number(average(scores).toFixed(2)),
    };
  });
}

export function buildDistribution(entries: FeedbackEntry[]): DistributionPoint[] {
  const total = entries.length;
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = entries.filter((entry) => entry.overallRating === rating).length;
    return { rating, count, share: total ? count / total : 0 };
  });
}

export function buildDashboard(
  entries: FeedbackEntry[],
  invitations: number,
  range: RangeKey,
  now: number = Date.now(),
): DashboardData {
  const current = filterByRange(entries, range, now);
  const days = rangeDays(range);

  let previous: FeedbackEntry[] = [];
  if (days !== null) {
    const cutoff = now - days * DAY;
    const previousCutoff = cutoff - days * DAY;
    previous = entries.filter((entry) => {
      const time = new Date(entry.createdAt).getTime();
      return time <= cutoff && time > previousCutoff;
    });
  }

  const currentAverage = average(current.map((entry) => entry.overallRating));
  const previousAverage = average(previous.map((entry) => entry.overallRating));
  const nps = buildNps(current);

  const kpis: Kpis = {
    total: current.length,
    averageRating: Number(currentAverage.toFixed(2)),
    nps: nps.score,
    responseRate: invitations > 0 ? Math.min(100, (current.length / invitations) * 100) : 0,
    invitations,
    averageDelta:
      days !== null && previous.length > 0 ? Number((currentAverage - previousAverage).toFixed(2)) : null,
    volumeDelta: days !== null && previous.length > 0 ? current.length - previous.length : null,
    promoters: nps.promoters,
    passives: nps.passives,
    detractors: nps.detractors,
  };

  return {
    kpis,
    trend: buildTrend(current, range, now),
    categories: buildCategoryAverages(current),
    distribution: buildDistribution(current),
    nps,
  };
}

export function categoryAverage(entry: FeedbackEntry): number {
  const values = CATEGORY_KEYS.map((key) => entry.categories[key]).filter((value) => value > 0);
  return Number(average(values).toFixed(1));
}
