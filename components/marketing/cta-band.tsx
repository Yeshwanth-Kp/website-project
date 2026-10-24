import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="py-20 lg:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-[28px] bg-primary px-7 py-14 text-primary-foreground sm:px-12 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px] [mask-image:radial-gradient(60%_80%_at_80%_20%,black,transparent)]"
          />

          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-label text-primary-foreground/70">
              Start with one desk
            </p>
            <h2 className="mt-4 text-balance text-4xl leading-[1.05] text-primary-foreground sm:text-5xl">
              Put a QR code where the goodbye happens.
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-primary-foreground/80">
              Try the guest flow exactly as a visitor sees it. No signup, no card —
              your responses stay in this browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Link href="/feedback">
                  Try the 60-second form
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link href="/admin">Open the dashboard</Link>
              </Button>
            </div>
          </div>

          <p
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 right-4 hidden font-display text-[160px] font-semibold leading-none text-primary-foreground/10 lg:block"
          >
            60s
          </p>
        </div>
      </div>
    </section>
  );
}
