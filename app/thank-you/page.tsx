import type { Metadata } from "next";

import { ThankYou } from "@/components/thank-you";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your feedback is on its way to the team.",
};

export default function ThankYouPage() {
  return <ThankYou />;
}
