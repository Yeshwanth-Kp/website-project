"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import { PhotoUpload } from "@/components/feedback/photo-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackFormValues } from "@/lib/feedback-schema";
import { COMMENT_MAX_LENGTH } from "@/lib/rating";
import { cn } from "@/lib/utils";

export function StepComment() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FeedbackFormValues>();

  const comment = useWatch({ control, name: "comment" });
  const length = comment.length;
  const nearLimit = length > COMMENT_MAX_LENGTH * 0.9;

  return (
    <div>
      <h2
        data-step-heading
        tabIndex={-1}
        className="text-2xl outline-none sm:text-[28px]"
      >
        In your own words.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Specifics help most — the thing that delighted you, or the thing we should
        fix before the next guest arrives.
      </p>

      <div className="mt-6">
        <div className="mb-1.5 flex items-baseline justify-between gap-4">
          <Label htmlFor="comment">
            Your comment <span className="text-destructive">*</span>
          </Label>
          <span
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              nearLimit && "font-semibold text-destructive",
            )}
            aria-live="polite"
          >
            {length} / {COMMENT_MAX_LENGTH}
          </span>
        </div>

        <Textarea
          id="comment"
          rows={6}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="The room was spotless, but the Wi-Fi dropped in the evening…"
          aria-invalid={Boolean(errors.comment)}
          aria-describedby="comment-hint comment-error"
          {...register("comment")}
        />

        <p id="comment-hint" className="mt-1.5 text-xs text-muted-foreground">
          A sentence or two is plenty. Please leave out personal details you would
          not want published.
        </p>

        {errors.comment?.message ? (
          <p
            id="comment-error"
            className="mt-1.5 text-xs font-medium text-destructive"
            role="alert"
          >
            {errors.comment.message}
          </p>
        ) : null}
      </div>

      <div className="mt-7">
        <Label className="mb-2 block">
          Add a photo{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Controller
          control={control}
          name="photoDataUrl"
          render={({ field }) => (
            <PhotoUpload value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="mt-8 border-t border-border pt-7">
        <h3 className="font-display text-lg">Can we reach you?</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional. Only used to follow up on this feedback — never shown on the
          public wall.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="guestName" className="mb-1.5 block">
              Name <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="guestName"
              autoComplete="name"
              placeholder="Priya Sharma"
              aria-invalid={Boolean(errors.guestName)}
              {...register("guestName")}
            />
            {errors.guestName?.message ? (
              <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                {errors.guestName.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="roomNumber" className="mb-1.5 block">
              Room <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="roomNumber"
              placeholder="Room 12"
              aria-invalid={Boolean(errors.roomNumber)}
              {...register("roomNumber")}
            />
            {errors.roomNumber?.message ? (
              <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                {errors.roomNumber.message}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="guestEmail" className="mb-1.5 block">
              Email <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="guestEmail"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.guestEmail)}
              {...register("guestEmail")}
            />
            {errors.guestEmail?.message ? (
              <p className="mt-1 text-xs font-medium text-destructive" role="alert">
                {errors.guestEmail.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
