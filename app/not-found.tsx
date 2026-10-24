import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader minimal />

      <main className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 max-w-lg text-balance text-4xl sm:text-5xl">
          This page has checked out.
        </h1>
        <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
          The link may be old, or the property code in that QR code does not
          exist. The feedback form is still right here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/feedback">Leave feedback</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
