"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import { StarRating } from "@/components/feedback/star-rating";
import type { FeedbackFormValues } from "@/lib/feedback-schema";
import { CATEGORY_META, QUICK_TAGS } from "@/lib/rating";
import { cn } from "@/lib/utils";

export function StepCategories() {
  const {
    control,
    formState: { errors },
  } = useFormContext<FeedbackFormValues>();

  const tags = useWatch({ control, name: "tags" });

  return (
    <div>
      <h2
        data-step-heading
        tabIndex={-1}
        className="text-2xl outline-none sm:text-[28px]"
      >
        What stood out?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Five quick ratings. Be as generous or as honest as the stay deserves.
      </p>

      <div className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
        {CATEGORY_META.map((category) => {
          const name = `categories.${category.key}` as const;
          const error = errors.categories?.[category.key]?.message;

          return (
            <div
              key={category.key}
              className="flex flex-col gap-2.5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{category.label}</p>
                <p className="text-xs text-muted-foreground">{category.description}</p>
                {error ? (
                  <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <StarRating
                    value={field.value}
                    onChange={field.onChange}
                    size="sm"
                    invalid={Boolean(error)}
                    label={`${category.label} rating`}
                    className="shrink-0"
                  />
                )}
              />
            </div>
          );
        })}
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-medium">
          Any tags?{" "}
          <span className="font-normal text-muted-foreground">
            (optional, up to 8)
          </span>
        </legend>
        <p className="mt-1 text-xs text-muted-foreground">
          Tags make it easier to spot patterns across a month of feedback.
        </p>

        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const active = field.value.includes(tag);
                const atLimit = field.value.length >= 8 && !active;

                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    disabled={atLimit}
                    onClick={() =>
                      field.onChange(
                        active
                          ? field.value.filter((value) => value !== tag)
                          : [...field.value, tag],
                      )
                    }
                    className={cn(
                      "focus-ring rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      atLimit && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        />

        {errors.tags?.message ? (
          <p className="mt-2 text-xs font-medium text-destructive" role="alert">
            {errors.tags.message}
          </p>
        ) : null}

        <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
          {tags.length} of 8 selected
        </p>
      </fieldset>
    </div>
  );
}
