"use client";

import { ArrowUpRight, Copy, QrCode } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Property } from "@/lib/types";

interface GuestLinkCardProps {
  property: Property;
  /** True when the dashboard is showing all properties and this is the featured one. */
  isFallback: boolean;
}

export function GuestLinkCard({ property, isFallback }: GuestLinkCardProps) {
  async function copyLink() {
    const url = `${window.location.origin}/r/${property.code}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success(`QR link copied for ${property.name}.`);
    } catch {
      toast.error("Could not copy the link automatically.");
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          <QrCode className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-label text-muted-foreground">
              Guest link
            </p>
            {isFallback ? (
              <Badge variant="outline">Featured property</Badge>
            ) : null}
          </div>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-semibold">
            {property.name}
            <span className="font-normal text-muted-foreground">
              · {property.city}
            </span>
            <code className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
              /r/{property.code}
            </code>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {isFallback
              ? "Showing the featured property. Pick another above to switch this link."
              : "Print this route as the QR code at checkout. It opens the form with the property preset."}
          </p>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
        <Button type="button" size="sm" variant="outline" onClick={() => void copyLink()}>
          <Copy aria-hidden="true" />
          Copy QR link
        </Button>
        <Button asChild size="sm">
          <Link href={`/feedback?property=${property.code}`}>
            Open form
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
