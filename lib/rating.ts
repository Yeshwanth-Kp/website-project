import type { CategoryKey, Sentiment } from "./types";

export const RATING_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Okay",
  4: "Great",
  5: "Exceptional",
};

export const RATING_HINTS: Record<number, string> = {
  1: "Something went badly wrong.",
  2: "Below what you expected.",
  3: "Fine, with room to improve.",
  4: "A genuinely good stay.",
  5: "One to remember.",
};

export function ratingLabel(value: number): string {
  return RATING_LABELS[Math.round(value)] ?? "Not rated";
}

export const CATEGORY_META: ReadonlyArray<{
  key: CategoryKey;
  label: string;
  description: string;
}> = [
  { key: "cleanliness", label: "Cleanliness", description: "Room, linens, bathroom" },
  { key: "staff", label: "Staff", description: "Welcome, help, follow-through" },
  { key: "food", label: "Food & drink", description: "Breakfast, bar, room service" },
  { key: "comfort", label: "Comfort", description: "Bed, noise, temperature" },
  { key: "value", label: "Value", description: "What you got for the price" },
];

export const SENTIMENT_META: Record<Sentiment, { emoji: string; label: string }> = {
  delighted: { emoji: "😍", label: "Delighted" },
  happy: { emoji: "😊", label: "Happy" },
  neutral: { emoji: "😐", label: "Neutral" },
  unhappy: { emoji: "😕", label: "Unhappy" },
  upset: { emoji: "😞", label: "Upset" },
};

export const QUICK_TAGS = [
  "Noise",
  "Wi-Fi",
  "Check-in",
  "Breakfast",
  "Bed comfort",
  "Water pressure",
  "Housekeeping",
  "Parking",
  "Location",
  "Value",
  "Pool",
  "Bar",
] as const;

export type QuickTag = (typeof QUICK_TAGS)[number];

export const COMMENT_MAX_LENGTH = 400;
export const COMMENT_MIN_LENGTH = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
