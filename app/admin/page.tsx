import type { Metadata } from "next";

import { Dashboard } from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "Guest insights",
  description:
    "Average rating, NPS, category scores and every guest note in one staff dashboard.",
};

export default function AdminPage() {
  return <Dashboard />;
}
