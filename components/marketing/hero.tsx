"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { QrPattern } from "@/components/qr-pattern";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(55%_60%_at_20%_0%,hsl(var(--primary)/0.10),transparent_70%),radial-gradient(45%_50%_at_90%_10%,hsl(var(--accent)/0.9),transparent_72%)]"
      />

      <div className="container grid items-center gap-16 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-24">
        <div>
          <motion.p
            className="eyebrow inline-flex items-center gap-2"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Guest feedback, minus the friction
          </motion.p>

          <motion.h1
            className="mt-5 max-w-[15ch] text-balance text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[4.15rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE, delay: 0.04 }}
          >
            Know what your guests{" "}
            <em className="font-normal italic text-primary">remember</em>.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE, delay: 0.08 }}
          >
            StayFeedback turns the QR code on the checkout desk into a 60-second
            conversation — then gives your team a dashboard they will actually open
            on Monday morning.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE, delay: 0.12 }}
          >
            <Button asChild size="lg">
              <Link href="/feedback">
                Leave feedback
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin">See the dashboard</Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span>No app to download</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>Works on any phone</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>Reads in one glance</span>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px] lg:max-w-none">
          <div
            aria-hidden="true"
            className="dot-grid pointer-events-none absolute -inset-8 -z-10 opacity-50 [mask-image:radial-gradient(55%_55%_at_50%_45%,black,transparent)]"
          />

          <motion.article
            className="relative rounded-[26px] border border-border bg-card p-6 shadow-lift sm:p-7"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: EASE, delay: 0.1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary font-display text-base font-semibold text-secondary-foreground">
                  W
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">Willow House</p>
                  <p className="text-xs text-muted-foreground">Copenhagen · Room 12</p>
                </div>
              </div>
              <Stars value={5} rounded />
            </div>

            <blockquote className="mt-6 font-display text-[21px] leading-snug text-balance">
              “The room was spotless and the team remembered our names by day two.”
            </blockquote>

            <div className="mt-5 flex flex-wrap gap-1.5">
              <Badge variant="default">Staff</Badge>
              <Badge variant="default">Cleanliness</Badge>
              <Badge variant="outline">Breakfast</Badge>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                  PS
                </span>
                <div className="text-xs leading-tight">
                  <p className="font-medium">Priya Sharma</p>
                  <p className="text-muted-foreground">Just now</p>
                </div>
              </div>
              <p className="text-xs font-medium text-success">NPS 10 · Promoter</p>
            </div>
          </motion.article>

          <motion.div
            className="absolute -right-3 top-8 hidden rounded-2xl border border-border bg-card p-3 shadow-lift sm:block lg:-right-8"
            initial={reduceMotion ? false : { opacity: 0, y: 8, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.28, ease: EASE, delay: 0.28 }}
          >
            <QrPattern className="h-16 w-16 rounded-md" />
            <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-label text-muted-foreground">
              Scan at checkout
            </p>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -left-4 hidden w-[172px] rounded-2xl border border-border bg-card p-4 shadow-lift sm:block lg:-left-10"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: EASE, delay: 0.36 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-label text-muted-foreground">
              Guest sentiment
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-3xl font-semibold leading-none">4.8</span>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
            <Stars value={4.8} rounded className="mt-2" size="xs" />
            <p className="mt-2 text-[11px] text-muted-foreground">
              86 responses this month
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
