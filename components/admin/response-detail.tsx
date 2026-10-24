"use client";

import { CalendarDays, Mail, X } from "lucide-react";
import * as React from "react";

import { Stars } from "@/components/stars";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/format";
import {
  CATEGORY_META,
  RATING_LABELS,
  SENTIMENT_META,
} from "@/lib/rating";
import type { FeedbackEntry, Sentiment } from "@/lib/types";

interface ResponseDetailProps {
  entry: FeedbackEntry | null;
  propertyName: string;
  onClose: () => void;
}

function sentimentVariant(sentiment: Sentiment): BadgeProps["variant"] {
  if (sentiment === "delighted" || sentiment === "happy") return "success";
  if (sentiment === "neutral") return "secondary";
  return "destructive";
}

export function ResponseDetail({
  entry,
  propertyName,
  onClose,
}: ResponseDetailProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (entry && !dialog.open) {
      dialog.showModal();
    } else if (!entry && dialog.open) {
      dialog.close();
    }
  }, [entry]);

  const sentiment = entry?.sentiment ? SENTIMENT_META[entry.sentiment] : null;
  const replyHref =
    entry?.guestEmail && entry.consent
      ? `mailto:${entry.guestEmail}?subject=${encodeURIComponent(
          `Your stay at ${propertyName}`,
        )}`
      : null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="response-detail-title"
      className="m-auto max-h-[88vh] w-[min(92vw,660px)] overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-lift open:animate-fade-in backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      {entry ? (
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
            <div className="min-w-0">
              <p className="eyebrow">Response detail</p>
              <h2 id="response-detail-title" className="mt-1.5 truncate text-xl">
                {entry.guestName ?? "Anonymous guest"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {propertyName}
                {entry.roomNumber ? ` · ${entry.roomNumber}` : ""}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {formatDate(entry.createdAt)}
                {formatTime(entry.createdAt)
                  ? ` at ${formatTime(entry.createdAt)}`
                  : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close response detail"
              className="shrink-0"
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <Stars value={entry.overallRating} size="md" />
                <span className="font-display text-lg">
                  {RATING_LABELS[entry.overallRating] ?? "Rated"}
                </span>
              </div>
              {sentiment ? (
                <Badge variant={sentimentVariant(entry.sentiment as Sentiment)}>
                  <span aria-hidden="true">{sentiment.emoji}</span>
                  {sentiment.label}
                </Badge>
              ) : null}
              {typeof entry.nps === "number" ? (
                <Badge variant="secondary">NPS {entry.nps}</Badge>
              ) : null}
            </div>

            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-label text-muted-foreground">
                The note
              </h3>
              <blockquote className="mt-2 border-l-2 border-primary/40 pl-4 text-[15px] leading-relaxed">
                {entry.comment}
              </blockquote>
            </section>

            {entry.photoDataUrl ? (
              <div className="overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.photoDataUrl}
                  alt="Photo attached to this feedback"
                  className="max-h-64 w-full object-cover"
                />
              </div>
            ) : null}

            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-label text-muted-foreground">
                Category scores
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {CATEGORY_META.map((category) => {
                  const score = entry.categories[category.key];

                  return (
                    <div
                      key={category.key}
                      className="rounded-md border border-border/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">{category.label}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {score}/5
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {entry.tags.length > 0 ? (
              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-label text-muted-foreground">
                  Tags
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-md border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold">Guest contact</p>
                  <p className="mt-1 truncate text-sm">
                    {entry.guestEmail ?? "No email left"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {entry.consent
                      ? "Happy to be contacted about this feedback."
                      : "Did not consent to follow-up."}
                  </p>
                </div>
                {replyHref ? (
                  <Button asChild size="sm">
                    <a href={replyHref}>
                      <Mail aria-hidden="true" />
                      Reply by email
                    </a>
                  </Button>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
