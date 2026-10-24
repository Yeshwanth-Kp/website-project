export interface LastSubmission {
  guestName: string | null;
  propertyName: string;
  propertyCode: string;
  rating: number;
  createdAt: string;
}

const KEY = "stayfeedback.lastSubmission.v1";

export function saveLastSubmission(submission: LastSubmission): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(submission));
  } catch {
    /* session storage can be unavailable in private mode — not critical */
  }
}

export function readLastSubmission(): LastSubmission | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const candidate = parsed as Partial<LastSubmission>;
    if (typeof candidate.propertyName !== "string") return null;
    if (typeof candidate.propertyCode !== "string") return null;
    if (typeof candidate.rating !== "number") return null;
    if (typeof candidate.createdAt !== "string") return null;

    return {
      guestName: typeof candidate.guestName === "string" ? candidate.guestName : null,
      propertyName: candidate.propertyName,
      propertyCode: candidate.propertyCode,
      rating: candidate.rating,
      createdAt: candidate.createdAt,
    };
  } catch {
    return null;
  }
}
