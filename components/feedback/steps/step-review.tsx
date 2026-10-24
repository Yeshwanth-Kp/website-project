"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { FeedbackFormValues } from "@/lib/feedback-schema";
import {
  CATEGORY_META,
  RATING_LABELS,
  SENTIMENT_META,
} from "@/lib/rating";
import { cn } from "@/lib/utils";

interface StepReviewProps {
  propertyName: string;
  onEdit: (step: number) => void;
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-background p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

export function StepReview({ propertyName, onEdit }: StepReviewProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<FeedbackFormValues>();

  const values = useWatch({ control }) as FeedbackFormValues;
  const sentiment = values.sentiment ? SENTIMENT_META[values.sentiment] : null;
  const hasContact = Boolean(
    values.guestName || values.guestEmail || values.roomNumber,
  );

  return (
    <div>
      <h2
        data-step-heading
        tabIndex={-1}
        className="text-2xl outline-none sm:text-[28px]"
      >
        Does this look right?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        One last look before it reaches the team. You can still change anything.
      </p>

      <div className="mt-6 space-y-3">
        <ReviewBlock title="Overall" onEdit={() => onEdit(0)}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Stars value={values.overallRating} size="md" />
            <span className="font-display text-xl">
              {RATING_LABELS[values.overallRating] ?? "Not rated"}
            </span>
            {sentiment ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <span aria-hidden="true">{sentiment.emoji}</span>
                {sentiment.label}
              </span>
            ) : null}
            {typeof values.nps === "number" ? (
              <Badge variant="secondary">NPS {values.nps}</Badge>
            ) : null}
          </div>
        </ReviewBlock>

        <ReviewBlock title="The details" onEdit={() => onEdit(1)}>
          <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {CATEGORY_META.map((category) => (
              <div
                key={category.key}
                className="flex items-center justify-between gap-3"
              >
                <dt className="text-sm text-muted-foreground">{category.label}</dt>
                <dd>
                  <Stars
                    value={values.categories?.[category.key] ?? 0}
                    size="xs"
                  />
                </dd>
              </div>
            ))}
          </dl>
        </ReviewBlock>

        <ReviewBlock title="Your words" onEdit={() => onEdit(2)}>
          {values.tags.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {values.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <blockquote className="border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-foreground/90">
            {values.comment}
          </blockquote>

          {values.photoDataUrl ? (
            <div className="mt-4 overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={values.photoDataUrl}
                alt="Photo attached to this feedback"
                className="max-h-44 w-full object-cover"
              />
            </div>
          ) : null}
        </ReviewBlock>

        <ReviewBlock title="About you" onEdit={() => onEdit(2)}>
          {hasContact ? (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              {values.guestName ? (
                <span>
                  <span className="text-foreground">{values.guestName}</span>
                </span>
              ) : null}
              {values.roomNumber ? <span>{values.roomNumber}</span> : null}
              {values.guestEmail ? <span>{values.guestEmail}</span> : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Staying anonymous — that is completely fine.
            </p>
          )}
        </ReviewBlock>
      </div>

      <div className="mt-6">
        <Controller
          control={control}
          name="consent"
          render={({ field }) => (
            <div
              className={cn(
                "flex items-start gap-3 rounded-md border p-4 transition-colors",
                errors.consent
                  ? "border-destructive/60 bg-destructive/5"
                  : "border-border bg-background",
              )}
            >
              <Checkbox
                id="consent"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "consent-error" : undefined}
                className="mt-0.5"
              />
              <label
                htmlFor="consent"
                className="cursor-pointer text-[13px] leading-relaxed text-muted-foreground"
              >
                I am happy for {propertyName} to store this feedback and to contact
                me at the email above if needed. My name and email are never shown
                publicly.
              </label>
            </div>
          )}
        />

        {errors.consent?.message ? (
          <p
            id="consent-error"
            className="mt-2 text-xs font-medium text-destructive"
            role="alert"
          >
            {errors.consent.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
