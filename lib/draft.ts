import { emptyFeedbackValues, type FeedbackFormValues } from "./feedback-schema";

const DRAFT_KEY = "stayfeedback.draft.v1";

export interface FeedbackDraft {
  propertyCode: string;
  step: number;
  values: FeedbackFormValues;
  savedAt: string;
}

export function saveDraft(input: Omit<FeedbackDraft, "savedAt">): FeedbackDraft | null {
  if (typeof window === "undefined") return null;

  const draft: FeedbackDraft = { ...input, savedAt: new Date().toISOString() };

  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return draft;
  } catch (error) {
    console.warn("StayFeedback: unable to save draft.", error);
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readDraft(propertyCode: string): FeedbackDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.propertyCode !== propertyCode) return null;
    if (typeof parsed.step !== "number" || typeof parsed.savedAt !== "string") return null;
    if (!isRecord(parsed.values)) return null;

    const values = parsed.values as Partial<FeedbackFormValues>;
    const categories = isRecord(values.categories) ? values.categories : {};

    const merged: FeedbackFormValues = {
      ...emptyFeedbackValues,
      ...values,
      categories: { ...emptyFeedbackValues.categories, ...categories },
      tags: Array.isArray(values.tags)
        ? values.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      photoDataUrl: typeof values.photoDataUrl === "string" ? values.photoDataUrl : null,
      consent: values.consent === true,
    };

    return {
      propertyCode,
      step: Math.min(3, Math.max(0, Math.round(parsed.step))),
      values: merged,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
