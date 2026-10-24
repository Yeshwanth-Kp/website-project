"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { QrPattern } from "@/components/qr-pattern";
import { Stars } from "@/components/stars";
import { Button } from "@/components/ui/button";
import { clamp } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { stiffness: 140, damping: 20, mass: 0.6 };

const PROMISES = ["No app to download", "Works on any phone", "Reads in one glance"];

export function Hero() {
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const [pointerActive, setPointerActive] = useState(false);

  // Normalised pointer position over the card, -0.5 → 0.5 on each axis.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-6, 6]), SPRING);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), SPRING);

  const sheenX = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-110, 110]),
    SPRING,
  );
  const sheenY = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [-70, 70]),
    SPRING,
  );

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    pointerX.set(clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5));
    pointerY.set(clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5));
    setPointerActive(true);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
    setPointerActive(false);
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-[#14100c] text-white"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      <HeroBackdrop />

      <div className="container relative z-10 flex min-h-[100svh] flex-col justify-center pb-28 pt-28 lg:pb-24 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="max-w-xl">
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-label text-[#F4C9AE]"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F0A97C]" />
              Guest feedback, minus the friction
            </motion.p>

            <motion.h1
              className="mt-6 max-w-[15ch] text-balance text-[2.85rem] leading-[1.02] tracking-[-0.03em] [text-shadow:0_2px_30px_rgba(0,0,0,0.3)] sm:text-6xl lg:text-[4.15rem]"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: EASE, delay: 0.04 }}
            >
              Know what your guests{" "}
              <em className="font-normal italic text-[#F5B38C]">remember</em>.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-[34rem] text-pretty text-[17px] leading-relaxed text-white/70"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: EASE, delay: 0.08 }}
            >
              From the QR code at checkout to the dashboard on Monday — a
              60-second conversation that tells you what guests remember, and what
              to fix before they book again.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: EASE, delay: 0.12 }}
            >
              <Button
                asChild
                size="lg"
                className="shadow-[0_18px_44px_-16px_rgba(194,65,12,0.85)]"
              >
                <Link href="/feedback">
                  Leave feedback
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/[0.06] text-white hover:border-white/40 hover:bg-white/[0.12] hover:text-white"
              >
                <Link href="/admin">See the dashboard</Link>
              </Button>
            </motion.div>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/60"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {PROMISES.map((promise) => (
                <span key={promise} className="inline-flex items-center gap-1.5">
                  <Check
                    className="h-3.5 w-3.5 text-[#F0A97C]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {promise}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-[450px] lg:mx-0 lg:ml-auto lg:mr-2 lg:max-w-[440px]"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: EASE, delay: 0.1 }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(235,148,89,0.3),transparent_66%)] blur-2xl"
            />

            <div className="[perspective:1500px]">
              <div className="relative [transform-style:preserve-3d] lg:[transform:rotateY(-5deg)_rotateX(2deg)]">
                <motion.div
                  ref={stageRef}
                  className="relative [transform-style:preserve-3d]"
                  style={reduceMotion ? undefined : { rotateX, rotateY }}
                >
                  <motion.div
                    aria-hidden="true"
                    className="absolute -inset-5 hidden rounded-[36px] border border-white/10 sm:block"
                    style={{ z: -60 }}
                  />

                  <article className="relative overflow-hidden rounded-[26px] border border-white/50 bg-[#FCF9F4] p-6 text-[#1C1917] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.75)] sm:p-7">
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 -ml-[200px] -mt-[200px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.85)_0%,transparent_62%)] mix-blend-soft-light transition-opacity duration-300"
                      style={{ x: sheenX, y: sheenY, opacity: pointerActive ? 0.8 : 0 }}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F1E4D5] font-display text-base font-semibold text-[#A8400F]">
                            K
                          </span>
                          <div>
                            <p className="text-sm font-semibold leading-tight">
                              Kumarakom Lake Resort
                            </p>
                            <p className="text-xs text-[#7C7066]">
                              Kerala · Lakefront villa
                            </p>
                          </div>
                        </div>
                      </div>

                      <blockquote className="mt-6 font-display text-[21px] leading-snug text-balance">
                        “The backwater at sunrise, the lamp at the door. We came
                        for two nights and stayed for four.”
                      </blockquote>

                      <div className="mt-4 flex items-center gap-2">
                        <Stars value={5} rounded />
                        <span className="text-[11px] font-medium text-[#7C7066]">
                          5.0 · Weekend stay
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-[#F4E7D8] px-2.5 py-1 text-[11px] font-medium text-[#8F3A12]">
                          Staff
                        </span>
                        <span className="rounded-full bg-[#F4E7D8] px-2.5 py-1 text-[11px] font-medium text-[#8F3A12]">
                          Cleanliness
                        </span>
                        <span className="rounded-full border border-[#E5D9CC] px-2.5 py-1 text-[11px] font-medium text-[#6F645B]">
                          Breakfast
                        </span>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#E9DED2] pt-5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EDE1D3] text-[11px] font-semibold text-[#7C4A2A]">
                            PS
                          </span>
                          <div className="text-xs leading-tight">
                            <p className="font-medium">Priya Sharma</p>
                            <p className="text-[#7C7066]">Just now</p>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-[#2F6B4F]">
                          NPS 10 · Promoter
                        </p>
                      </div>
                    </div>
                  </article>

                  <motion.div
                    className="absolute -top-6 left-3 hidden items-center gap-2.5 rounded-2xl border border-white/45 bg-[#FCF9F4] py-2 pl-2 pr-3.5 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.65)] sm:flex"
                    style={{ z: 85 }}
                    initial={
                      reduceMotion ? false : { opacity: 0, y: 8, rotate: -4, scale: 0.96 }
                    }
                    animate={{ opacity: 1, y: 0, rotate: -2, scale: 1 }}
                    transition={{ duration: 0.28, ease: EASE, delay: 0.34 }}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F4E7D8] text-[#A8400F]">
                      <Star
                        className="h-3.5 w-3.5 fill-current"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[12px] font-semibold text-[#1C1917]">4.8 / 5</p>
                      <p className="text-[10px] text-[#7C7066]">
                        86 responses this month
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -right-2 -top-10 hidden rounded-2xl border border-white/45 bg-[#FCF9F4] p-3 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] sm:block lg:-right-6"
                    style={{ z: 60 }}
                    initial={
                      reduceMotion ? false : { opacity: 0, y: 10, rotate: 6, scale: 0.97 }
                    }
                    animate={{ opacity: 1, y: 0, rotate: 3, scale: 1 }}
                    transition={{ duration: 0.28, ease: EASE, delay: 0.3 }}
                  >
                    <QrPattern className="h-16 w-16 rounded-md" />
                    <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-label text-[#7C7066]">
                      Scan at checkout
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-28 right-8 z-10 hidden items-center gap-2 text-[10px] font-medium uppercase tracking-label text-white/45 lg:flex">
        <span className="inline-block h-1 w-1 rounded-full bg-white/35" />
        Filmed at Kumarakom Lake Resort, Kerala
      </p>
    </section>
  );
}
