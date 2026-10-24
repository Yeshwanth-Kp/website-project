import { Card } from "@/components/ui/card";
import type { DistributionPoint } from "@/lib/analytics";

export function RatingDistribution({ data }: { data: DistributionPoint[] }) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold">Rating distribution</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {total} {total === 1 ? "response" : "responses"} in this period
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {data.map((row) => {
          const width = row.count > 0 ? Math.max(row.share * 100, 3) : 0;

          return (
            <div key={row.rating} className="flex items-center gap-3">
              <span className="w-9 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                {row.rating} ★
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {row.count}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-auto pt-5 text-xs leading-relaxed text-muted-foreground">
        A healthy distribution leans right: most guests at four or five, very few
        at one.
      </p>
    </Card>
  );
}
