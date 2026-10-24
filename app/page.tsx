import { CtaBand } from "@/components/marketing/cta-band";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { TrustPoints } from "@/components/marketing/trust-points";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader overVideo />
      <main className="flex-1">
        <Hero />
        <TrustPoints />
        <HowItWorks />
        <Testimonials />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
