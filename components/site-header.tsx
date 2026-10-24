"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/admin", label: "Dashboard" },
] as const;

interface SiteHeaderProps {
  minimal?: boolean;
  /** Overlay a fixed, transparent header on the landing hero until scroll. */
  overVideo?: boolean;
}

export function SiteHeader({ minimal = false, overVideo = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!overVideo) return;

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overVideo]);

  const solid = !overVideo || scrolled || open;
  const onDark = overVideo && !solid;

  return (
    <header
      className={cn(
        "z-40 border-b transition-colors duration-200",
        overVideo ? "fixed inset-x-0 top-0" : "sticky top-0",
        solid
          ? "border-border/70 bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      {onDark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/45 to-transparent"
        />
      )}

      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className={cn(
            "focus-ring group inline-flex items-center gap-2.5 rounded-lg",
            onDark ? "text-white" : "text-foreground",
          )}
          aria-label="StayFeedback home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-rotate-3">
            S
          </span>
          <span className="font-display text-[19px] font-semibold tracking-tight">
            StayFeedback
          </span>
        </Link>

        {!minimal && (
          <>
            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    onDark
                      ? "text-white/75 hover:bg-white/10 hover:text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle
                className={cn(
                  onDark &&
                    "border-white/25 bg-white/10 text-white/85 hover:border-white/40 hover:bg-white/15 hover:text-white",
                )}
              />
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/feedback">Leave feedback</Link>
              </Button>
              <button
                type="button"
                className={cn(
                  "focus-ring grid h-10 w-10 place-items-center rounded-full border transition-colors md:hidden",
                  onDark
                    ? "border-white/25 text-white hover:bg-white/10"
                    : "border-border text-foreground",
                )}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </>
        )}

        {minimal && (
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">
              60-second guest form
            </span>
            <ThemeToggle />
          </div>
        )}
      </div>

      <AnimatePresence>
        {!minimal && open && (
          <motion.div
            id="mobile-nav"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <nav aria-label="Mobile" className="container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-2">
                <Link href="/feedback">Leave feedback</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function AdminNavLink({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <Link
      href="/admin"
      className={cn(
        "text-sm font-medium",
        pathname === "/admin" ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      Dashboard
    </Link>
  );
}
