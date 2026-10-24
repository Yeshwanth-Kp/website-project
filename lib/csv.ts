import { getPropertyById } from "./properties";
import type { FeedbackEntry } from "./types";

const HEADERS = [
  "id",
  "created_at",
  "property_id",
  "property_name",
  "overall_rating",
  "sentiment",
  "nps",
  "cleanliness",
  "staff",
  "food",
  "comfort",
  "value",
  "tags",
  "comment",
  "guest_name",
  "guest_email",
  "room_number",
] as const;

function escapeCell(value: string | number | null): string {
  if (value === null) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function entriesToCsv(entries: FeedbackEntry[]): string {
  const rows = entries.map((entry) =>
    [
      entry.id,
      entry.createdAt,
      entry.propertyId,
      getPropertyById(entry.propertyId)?.name ?? entry.propertyId,
      entry.overallRating,
      entry.sentiment,
      entry.nps,
      entry.categories.cleanliness,
      entry.categories.staff,
      entry.categories.food,
      entry.categories.comfort,
      entry.categories.value,
      entry.tags.join("|"),
      entry.comment,
      entry.guestName,
      entry.guestEmail,
      entry.roomNumber,
    ]
      .map(escapeCell)
      .join(","),
  );

  return [HEADERS.join(","), ...rows].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
