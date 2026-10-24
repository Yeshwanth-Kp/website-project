import type { FieldPath } from "react-hook-form";
import { z } from "zod";

import { COMMENT_MAX_LENGTH, COMMENT_MIN_LENGTH } from "./rating";
import { SENTIMENTS } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const categoryRating = z
  .number({ invalid_type_error: "Rate this category" })
  .min(1, "Rate this category")
  .max(5);

export const categoryRatingsSchema = z.object({
  cleanliness: categoryRating,
  staff: categoryRating,
  food: categoryRating,
  comfort: categoryRating,
  value: categoryRating,
});

export const feedbackFormSchema = z.object({
  overallRating: z
    .number({ invalid_type_error: "Choose a star rating" })
    .min(1, "Choose a star rating")
    .max(5),
  sentiment: z.enum(SENTIMENTS).nullable(),
  nps: z.number().min(0).max(10).nullable(),
  categories: categoryRatingsSchema,
  tags: z.array(z.string().max(40)).max(8, "Pick up to 8 tags"),
  comment: z
    .string()
    .trim()
    .min(COMMENT_MIN_LENGTH, "A few words is enough — at least 5 characters")
    .max(COMMENT_MAX_LENGTH, `Keep it under ${COMMENT_MAX_LENGTH} characters`),
  guestName: z.string().trim().max(80, "Keep it under 80 characters"),
  guestEmail: z
    .string()
    .trim()
    .max(120, "Keep it under 120 characters")
    .refine((value) => value === "" || EMAIL_PATTERN.test(value), {
      message: "Enter a valid email address",
    }),
  roomNumber: z.string().trim().max(20, "Keep it under 20 characters"),
  photoDataUrl: z.string().nullable(),
  consent: z.boolean().refine((value) => value, {
    message: "Please confirm we can store your feedback",
  }),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export function createEmptyFeedbackValues(): FeedbackFormValues {
  return {
    overallRating: 0,
    sentiment: null,
    nps: null,
    categories: {
      cleanliness: 0,
      staff: 0,
      food: 0,
      comfort: 0,
      value: 0,
    },
    tags: [],
    comment: "",
    guestName: "",
    guestEmail: "",
    roomNumber: "",
    photoDataUrl: null,
    consent: false,
  };
}

export const emptyFeedbackValues: FeedbackFormValues = createEmptyFeedbackValues();

export const STEP_FIELDS: ReadonlyArray<
  ReadonlyArray<FieldPath<FeedbackFormValues>>
> = [
  ["overallRating", "sentiment", "nps"],
  ["categories"],
  ["comment", "guestName", "guestEmail", "roomNumber", "photoDataUrl"],
  ["consent"],
];
