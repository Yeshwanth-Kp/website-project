"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import { StarRating } from "@/components/feedback/star-rating";
import type { FeedbackFormValues } from "@/lib/feedback-schema";
import {
  RATING_HINTS,
  RATING_LABELS,
  SENTIMENT_META,
} from "@/lib/rating";
import { SENTIMENTS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StepRating() {
  const {
    control,
    formState: { errors },
  } = useFormContext<FeedbackFormValues>();

  const rating = useWatch({ control, name: "overallRating" });
  const nps = useWatch({ control, name: "nps" });

  return (
    <div>
      <h2
        data-step-heading
        tabIndex={-1}
        className="text-2xl outline-none sm:text-[28px]"
      >
        First, the big picture.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        One star is honest, five is memorable. There is no wrong answer.
      </p>

      <div className="mt-7 rounded-lg border border-border bg-background px-5 py-8 text-center">
        <Controller
          control={control}
          name="overallRating"
          render={({ field }) => (
            <StarRating
              value={field.value}
              onChange={field.onChange}
              size="lg"
              invalid={Boolean(errors.overallRating)}
              label="Overall star rating"
              className="justify-center"
            />
          )}
        />

        <div className="mt-4" aria-live="polite">
          <p className="font-display text-2xl">
            {rating > 0 ? RATING_LABELS[rating] : "Tap a star"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {rating > 0
              ? RATING_HINTS[rating]
              : "How was the stay, all things considered?"}
          </p>
        </div>

        {errors.overallRating?.message ? (
          <p className="mt-3 text-sm font-medium text-destructive" role="alert">
            {errors.overallRating.message}
          </p>
        ) : null}
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-medium">
          How did it feel?{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </legend>
        <Controller
          control={control}
          name="sentiment"
          render={({ field }) => (
            <div className="mt-3 flex flex-wrap gap-2">
              {SENTIMENTS.map((key) => {
                const meta = SENTIMENT_META[key];
                const active = field.value === key;

                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => field.onChange(active ? null : key)}
                    className={cn(
                      "focus-ring inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "border-primary bg-accent text-accent-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <span aria-hidden="true" className="text-lg leading-none">
                      {meta.emoji}
                    </span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}
        />
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-sm font-medium">
          How likely are you to recommend us?{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </legend>

        <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-label text-muted-foreground">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>

        <Controller
          control={control}
          name="nps"
          render={({ field }) => (
            <div
              role="group"
              aria-label="Likelihood to recommend, from 0 to 10"
              className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-11"
            >
              {Array.from({ length: 11 }, (_, score) => score).map((score) => {
                const active = field.value === score;

                return (
                  <button
                    key={score}
                    type="button"
                    aria-pressed={active}
                    aria-label={`Score ${score} out of 10`}
                    onClick={() => field.onChange(active ? null : score)}
                    className={cn(
                      "focus-ring h-10 rounded-md border text-sm font-medium tabular-nums transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
          )}
        />

        <p className="mt-2 text-xs text-muted-foreground">
          {typeof nps === "number"
            ? nps >= 9
              ? "A promoter — thank you. That means a lot."
              : nps >= 7
                ? "A passive score. We would love to know what would make it a 9."
                : "Thank you for the honesty. We will look into what went wrong."
            : "9–10 means you would recommend us; 0–6 tells us we have work to do."}
        </p>
      </fieldset>
    </div>
  );
}
