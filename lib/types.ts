export const CATEGORY_KEYS = [
  "cleanliness",
  "staff",
  "food",
  "comfort",
  "value",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type CategoryRatings = Record<CategoryKey, number>;

export const SENTIMENTS = [
  "delighted",
  "happy",
  "neutral",
  "unhappy",
  "upset",
] as const;

export type Sentiment = (typeof SENTIMENTS)[number];

export interface Property {
  id: string;
  code: string;
  name: string;
  city: string;
  /** Demo denominator for the "response rate" KPI. */
  invitationsSent: number;
}

export interface FeedbackEntry {
  id: string;
  propertyId: string;
  createdAt: string;
  overallRating: number;
  sentiment: Sentiment | null;
  /** 0–10, null when the guest skipped the question. */
  nps: number | null;
  categories: CategoryRatings;
  tags: string[];
  comment: string;
  guestName: string | null;
  guestEmail: string | null;
  roomNumber: string | null;
  photoDataUrl: string | null;
  consent: boolean;
}

export type FeedbackCreateInput = Omit<FeedbackEntry, "id" | "createdAt">;
