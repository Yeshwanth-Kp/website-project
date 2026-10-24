import { notFound, redirect } from "next/navigation";

import { getPropertyByCode } from "@/lib/properties";

interface QrEntryPageProps {
  params: Promise<{ code: string }>;
}

/**
 * QR entry point. A physical QR code points at /r/<property-code>, which
 * resolves the property and forwards into the guest form with it pre-selected.
 */
export default async function QrEntryPage({ params }: QrEntryPageProps) {
  const { code } = await params;
  const property = getPropertyByCode(code);

  if (!property) notFound();

  redirect(`/feedback?property=${property.code}`);
}
