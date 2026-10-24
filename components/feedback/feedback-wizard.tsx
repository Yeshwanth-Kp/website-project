"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  History,
  Loader2,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { StepCategories } from "@/components/feedback/steps/step-categories";
import { StepComment } from "@/components/feedback/steps/step-comment";
import { StepRating } from "@/components/feedback/steps/step-rating";
import { StepReview } from "@/components/feedback/steps/step-review";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  clearDraft,
  readDraft,
  saveDraft,
} from "@/lib/draft";
import {
  STEP_FIELDS,
  createEmptyFeedbackValues,
  feedbackFormSchema,
  type FeedbackFormValues,
} from "@/lib/feedback-schema";
import { formatTime } from "@/lib/format";
import { saveLastSubmission } from "@/lib/last-submission";
import { repository } from "@/lib/repository";
import type { Property } from "@/lib/types";
import { clamp, cn } from "@/lib/utils";

const STEP_TITLES = ["Rating", "Details", "Your words", "Review"] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export function FeedbackWizard({ property }: { property: Property }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [restored, setRestored] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  const cardRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);
  const autosaveTimer = React.useRef<number | null>(null);
  const submittedRef = React.useRef(false);
  const suppressSaveRef = React.useRef(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: createEmptyFeedbackValues(),
    mode: "onTouched",
  });

  /* Resume an unfinished response. */
  React.useEffect(() => {
    const draft = readDraft(property.code);
    if (!draft) return;

    suppressSaveRef.current = true;
    form.reset(draft.values);
    setStep(draft.step);
    setSavedAt(draft.savedAt);
    setRestored(true);
  }, [form, property.code]);

  /* Debounced autosave on every change. */
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      if (submittedRef.current) return;
      if (suppressSaveRef.current) {
        suppressSaveRef.current = false;
        return;
      }
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);

      autosaveTimer.current = window.setTimeout(() => {
        if (submittedRef.current) return;
        const draft = saveDraft({
          propertyCode: property.code,
          step,
          values: values as FeedbackFormValues,
        });
        if (draft) setSavedAt(draft.savedAt);
      }, 600);
    });

    return () => {
      subscription.unsubscribe();
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, [form, property.code, step]);

  /* Move focus and scroll to the new step, but not on first paint. */
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const heading = document.querySelector<HTMLElement>("[data-step-heading]");
    heading?.focus({ preventScroll: true });
    cardRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [step, reduceMotion]);

  const goTo = React.useCallback(
    (next: number) => {
      setDirection(next > step ? 1 : -1);
      setStep(clamp(next, 0, 3));
    },
    [step],
  );

  async function handleNext() {
    const fields = STEP_FIELDS[step];
    if (!fields) return;

    const valid = await form.trigger([...fields], { shouldFocus: true });
    if (!valid) return;

    goTo(step + 1);
  }

  function handleBack() {
    goTo(step - 1);
  }

  function handleDiscardDraft() {
    suppressSaveRef.current = true;
    form.reset(createEmptyFeedbackValues());
    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    clearDraft();
    setStep(0);
    setRestored(false);
    setSavedAt(null);
    toast.success("Started a fresh response.");
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await repository.create({
        propertyId: property.id,
        overallRating: values.overallRating,
        sentiment: values.sentiment,
        nps: values.nps,
        categories: values.categories,
        tags: values.tags,
        comment: values.comment,
        guestName: values.guestName.trim() || null,
        guestEmail: values.guestEmail.trim() || null,
        roomNumber: values.roomNumber.trim() || null,
        photoDataUrl: values.photoDataUrl,
        consent: values.consent,
      });

      clearDraft();
      submittedRef.current = true;
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
        autosaveTimer.current = null;
      }
      saveLastSubmission({
        guestName: values.guestName.trim() || null,
        propertyName: property.name,
        propertyCode: property.code,
        rating: values.overallRating,
        createdAt: new Date().toISOString(),
      });

      toast.success("Feedback sent. Thank you.");
      router.push("/thank-you");
    } catch (error) {
      console.error("StayFeedback: could not save feedback.", error);
      toast.error("We could not save your feedback. Please try again.");
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader minimal />

      <main className="container max-w-3xl flex-1 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {property.name} · {property.city}
            </p>
            <h1 className="mt-2 text-balance text-3xl sm:text-[38px]">
              How was your stay?
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">Takes about 60 seconds</p>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>
              Step {step + 1} of 4 · {STEP_TITLES[step]}
            </span>
            <span className="inline-flex items-center gap-1.5" aria-live="polite">
              {savedAt ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  Draft saved {formatTime(savedAt)}
                </>
              ) : (
                "Draft autosaves"
              )}
            </span>
          </div>
          <Progress
            value={((step + 1) / 4) * 100}
            aria-label={`Step ${step + 1} of 4`}
          />
        </div>

        <div
          ref={cardRef}
          className="mt-6 scroll-mt-24 rounded-lg border border-border bg-card shadow-soft"
        >
          <form onSubmit={onSubmit} noValidate>
            <FormProvider {...form}>
              <div className="p-6 sm:p-9">
              {restored ? (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/20 bg-accent px-4 py-2.5 text-xs text-accent-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" aria-hidden="true" />
                    Draft restored
                    {savedAt ? ` from ${formatTime(savedAt)}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="focus-ring rounded font-semibold underline underline-offset-4"
                  >
                    Start fresh
                  </button>
                </div>
              ) : null}

              <motion.div
                key={step}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: direction > 0 ? 18 : -18 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE }}
              >
                {step === 0 ? <StepRating /> : null}
                {step === 1 ? <StepCategories /> : null}
                {step === 2 ? <StepComment /> : null}
                {step === 3 ? (
                  <StepReview propertyName={property.name} onEdit={goTo} />
                ) : null}
              </motion.div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-5 sm:px-9">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0 || submitting}
                className={cn(step === 0 && "invisible")}
              >
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>

              {step < 3 ? (
                <Button type="button" onClick={() => void handleNext()}>
                  Continue
                  <ArrowRight aria-hidden="true" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {submitting ? "Sending…" : "Submit feedback"}
                </Button>
              )}
            </div>
            </FormProvider>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Your progress saves on this device. Nothing is sent anywhere else — this
          is a frontend demo.
        </p>
      </main>
    </div>
  );
}
