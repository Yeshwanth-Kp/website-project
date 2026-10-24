import type { FeedbackCreateInput, FeedbackEntry } from "../types";

/**
 * The only interface the UI knows about.
 *
 * Swapping to Supabase/Prisma means writing one more implementation of this
 * interface and changing the single export in `lib/repository/index.ts`.
 */
export interface FeedbackRepository {
  list(): Promise<FeedbackEntry[]>;
  create(input: FeedbackCreateInput): Promise<FeedbackEntry>;
  seed(): Promise<void>;
  reset(): Promise<void>;
}
