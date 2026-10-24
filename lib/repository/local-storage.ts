import type { FeedbackCreateInput, FeedbackEntry } from "../types";
import { createSeedEntries } from "./seed";
import type { FeedbackRepository } from "./types";

const STORAGE_KEY = "stayfeedback.entries.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(): FeedbackEntry[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: FeedbackEntry[]): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("StayFeedback: unable to persist feedback in localStorage.", error);
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortNewest(entries: FeedbackEntry[]): FeedbackEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const localStorageRepository: FeedbackRepository = {
  async list(): Promise<FeedbackEntry[]> {
    const entries = read();

    if (entries.length === 0) {
      const seeded = createSeedEntries();
      write(seeded);
      return sortNewest(seeded);
    }

    return sortNewest(entries);
  },

  async create(input: FeedbackCreateInput): Promise<FeedbackEntry> {
    const entry: FeedbackEntry = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
    };

    write([entry, ...read()]);
    return entry;
  },

  async seed(): Promise<void> {
    write(createSeedEntries());
  },

  async reset(): Promise<void> {
    if (!isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
