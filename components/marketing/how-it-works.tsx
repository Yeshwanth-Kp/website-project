import { Reveal } from "@/components/reveal";

const STEPS = [
  {
    number: "01",
    title: "Print your code",
    description:
      "Each property gets its own QR link. Put it on the desk, the key sleeve, or the back of the menu — no hardware needed.",
  },
  {
    number: "02",
    title: "Guests scan and rate",
    description:
      "A star rating, five categories, an optional note. The form autosaves as they go, so a dropped connection is not a lost response.",
  },
  {
    number: "03",
    title: "Read the signal",
    description:
      "Ratings, NPS and categories land in one place, with the comments that explain the numbers. Export the week to CSV in a click.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 lg:py-28">
      <div className="container">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-4 text-balance text-4xl sm:text-5xl">
            Three steps between a guest and a better stay.
          </h2>
          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Most feedback tools ask for more than a guest will give. StayFeedback is
            built around the thirty seconds someone actually has at checkout.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.06}>
              <div className="h-full bg-card p-8 lg:p-10">
                <span className="font-display text-sm font-semibold tracking-[0.18em] text-primary">
                  {step.number}
                </span>
                <h3 className="mt-10 text-[22px] leading-snug">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
