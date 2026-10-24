import { localStorageRepository } from "./local-storage";
import type { FeedbackRepository } from "./types";

export type { FeedbackRepository } from "./types";

/**
 * Single swap point for a real backend.
 *
 * e.g.
 *   import { supabaseRepository } from "./supabase";
 *   export const repository: FeedbackRepository = supabaseRepository;
 */
export const repository: FeedbackRepository = localStorageRepository;
