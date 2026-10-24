import Link from "next/link";

import { PROPERTIES } from "@/lib/properties";

const PRODUCT_LINKS = [
  { href: "/feedback", label: "Leave feedback" },
  { href: "/admin", label: "Staff dashboard" },
  { href: "/#how-it-works", label: "How it works" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground">
              S
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              StayFeedback
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Guest feedback for independent hotels, resorts and restaurants. One QR
            code, one minute, no app.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4">Product</p>
          <ul className="space-y-2.5 text-sm">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="focus-ring rounded text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Try it</p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {PROPERTIES.map((property) => (
              <li key={property.id}>
                <Link
                  href={`/r/${property.code}`}
                  className="focus-ring rounded transition-colors hover:text-foreground"
                >
                  {property.name} QR link
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 StayFeedback. A frontend demo — no data leaves your browser.</p>
        <p>Made for the people who make stays memorable.</p>
      </div>
    </footer>
  );
}
