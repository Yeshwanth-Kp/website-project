import { Clock3, Smartphone, TrendingUp } from "lucide-react";

import { Reveal } from "@/components/reveal";

const POINTS = [
  {
    icon: Clock3,
    title: "60 seconds, not a survey",
    description:
      "Three short steps and a star rating. Guests finish it while they are still standing at the desk.",
  },
  {
    icon: Smartphone,
    title: "Designed for one thumb",
    description:
      "No app, no account, no login wall. It opens from a QR code on any phone and remembers a half-finished draft.",
  },
  {
    icon: TrendingUp,
    title: "Closes the loop",
    description:
      "Every note lands in one dashboard, sorted by category, so the fix is obvious by Tuesday stand-up.",
  },
] as const;

export function TrustPoints() {
  return (
    <section aria-label="Why StayFeedback" className="border-y border-border bg-card/60">
      <div className="container grid gap-10 py-14 md:grid-cols-3 md:gap-8">
        {POINTS.map((point, index) => (
          <Reveal key={point.title} delay={index * 0.05}>
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background text-primary">
                <point.icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
