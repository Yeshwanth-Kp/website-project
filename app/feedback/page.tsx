import type { Metadata } from "next";

import { FeedbackWizard } from "@/components/feedback/feedback-wizard";
import { DEFAULT_PROPERTY, getPropertyByCode } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Leave feedback",
  description:
    "Tell us about your stay — a star rating, a few details, and anything we should fix. About 60 seconds.",
};

interface FeedbackPageProps {
  searchParams: Promise<{ property?: string | string[] }>;
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const params = await searchParams;
  const code = typeof params.property === "string" ? params.property : null;
  const property = getPropertyByCode(code) ?? DEFAULT_PROPERTY;

  return <FeedbackWizard property={property} />;
}
