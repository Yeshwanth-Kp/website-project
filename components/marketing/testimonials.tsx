import { Quote } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { Stars } from "@/components/stars";

const TESTIMONIALS = [
  {
    quote:
      "We used to get four comments a month. Now we get four a day, and they are specific enough to act on. The housekeeping notes alone paid for the year.",
    name: "Elena Rossi",
    role: "General Manager, Kumarakom Lake Resort",
    rating: 5,
  },
  {
    quote:
      "The form is the first one guests actually finish. I watch the counter at the desk and they are done before their taxi arrives.",
    name: "Marcus Feld",
    role: "Front of House, Casa Oliva",
    rating: 5,
  },
  {
    quote:
      "I said the shower pressure was weak and mentioned it to the front desk on my way out. By the time I booked again, it was fixed. That never happens.",
    name: "Aiko Tanaka",
    role: "Returning guest",
    rating: 5,
  },
] as const;

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 border-t border-border bg-card/50 py-20 lg:py-28">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">Stories</p>
            <h2 className="mt-4 text-balance text-4xl sm:text-5xl">
              Loved by the people behind the desk.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Sample quotes from the demo properties. Yours will sound like your
            guests.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.05}>
              <figure className="flex h-full flex-col rounded-lg border border-border bg-background p-7 shadow-soft">
                <Quote
                  className="h-6 w-6 text-primary/30"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <blockquote className="mt-5 flex-1 font-display text-[19px] leading-relaxed text-balance">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                    {testimonial.name
                      .split(" ")
                      .map((part) => part.charAt(0))
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">
                      {testimonial.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                  <Stars value={testimonial.rating} rounded size="xs" className="ml-auto" />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
