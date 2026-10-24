"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  MessageSquare,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Stars } from "@/components/stars";
import { Button } from "@/components/ui/button";
import { RATING_LABELS } from "@/lib/rating";
import { readLastSubmission, type LastSubmission } from "@/lib/last-submission";

const NEXT_STEPS = [
  {
    icon: Clock3,
    title: "Read before the morning handover",
    description:
      "The duty manager reads every note at the start of the day. Nothing sits in an inbox for a week.",
  },
  {
    icon: Wrench,
    title: "Logged with an owner",
    description:
      "Anything broken becomes a task with a name attached — not a line in a spreadsheet nobody opens.",
  },
  {
    icon: MessageSquare,
    title: "A reply, if you left an email",
    description:
      "A real person answers. If you asked us to fix something, we will tell you what we did.",
  },
] as const;

export function ThankYou() {
  const reduceMotion = useReducedMotion();
  const [submission, setSubmission] = React.useState<LastSubmission | null>(null);

  React.useEffect(() => {
    setSubmission(readLastSubmission());
  }, []);

  const firstName = submission?.guestName?.trim().split(/\s+/)[0] ?? null;
  const propertyName = submission?.propertyName ?? "the team";

  async function copyLink() {
    const suffix = submission ? `?property=${submission.propertyCode}` : "";
    const url = `${window.location.origin}/feedback${suffix}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Feedback link copied.");
    } catch {
      toast.error("Could not copy automatically — you can copy the address bar.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader minimal />

      <main className="container max-w-3xl flex-1 py-14 sm:py-20">
        <div className="text-center">
          <motion.span
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground shadow-soft"
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
          >
            <Check className="h-7 w-7" strokeWidth={2.4} aria-hidden="true" />
          </motion.span>

          <p className="eyebrow mt-6">Feedback received</p>
          <h1 className="mt-3 text-balance text-4xl sm:text-5xl">
            Thank you{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
            Your notes are with {propertyName}. Honest feedback is the fastest way
            for a good stay to become a great one.
          </p>

          {submission ? (
            <div className="mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-soft">
              <Stars value={submission.rating} size="xs" />
              <span className="font-medium">
                {RATING_LABELS[submission.rating] ?? "Rated"}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{submission.propertyName}</span>
            </div>
          ) : null}
        </div>

        <section className="mt-12 rounded-lg border border-border bg-card p-6 shadow-soft sm:p-8">
          <h2 className="text-xl">What happens next</h2>
          <div className="mt-6 space-y-5">
            {NEXT_STEPS.map((step) => (
              <div key={step.title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <step.icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-background p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold">Know someone staying soon?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Send them the guest form — it works on any phone.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyLink()}>
            <Copy aria-hidden="true" />
            Copy feedback link
          </Button>
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild>
            <Link href="/admin">
              See the staff dashboard
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Demo note: this response is stored in your browser only. Clearing site
          data removes it.
        </p>
      </main>
    </div>
  );
}
