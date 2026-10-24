# StayFeedback

Guest feedback for hotels, resorts and restaurants. A guest scans the QR code at
checkout, leaves feedback in under a minute, and the team sees the signal in a
clean dashboard.

Built with Next.js 15 (App Router), TypeScript in strict mode, Tailwind CSS,
shadcn/ui-style primitives, Framer Motion, React Hook Form + Zod, and Recharts.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (next config)
npm run build       # production build
```

## Routes

| Route | What it does |
| --- | --- |
| `/` | Landing page: hero, trust points, how it works, testimonials, CTA |
| `/feedback` | Four-step guest form: rating, categories, comment/photo, review |
| `/thank-you` | Confirmation, what happens next, copy-the-link prompt |
| `/r/[code]` | QR entry point — resolves a property and redirects to `/feedback?property=…` |
| `/admin` | Staff dashboard: KPIs, property performance, guest link, rating trend, category scores, NPS, distribution, filterable responses with detail view |

Demo QR links:

- `/r/kumarakom-lake-resort` (featured property, default guest form)
- `/r/willow-house`
- `/r/casa-oliva`
- `/r/harborview`

An unknown code renders the branded 404.

## Data

Everything runs without a backend.

- Responses are stored in `localStorage` under `stayfeedback.entries.v1`.
- The dashboard seeds 84 deterministic demo responses across four properties,
  weighted toward Kumarakom Lake Resort. Older three-property demo sets are
  refreshed automatically while any real guest submissions are kept.
- The guest form autosaves a draft to `stayfeedback.draft.v1` and restores it on
  reload (photos are downscaled to keep the draft small).
- The last submission summary is passed to `/thank-you` via `sessionStorage`.
- The admin can scope every metric and CSV export by property and date range,
  open a response for the full note and category scores, and copy the QR route
  for the selected property.

### Swapping in a real backend

The UI only depends on `FeedbackRepository` in `lib/repository/types.ts`:

```ts
export interface FeedbackRepository {
  list(): Promise<FeedbackEntry[]>;
  create(input: FeedbackCreateInput): Promise<FeedbackEntry>;
  seed(): Promise<void>;
  reset(): Promise<void>;
}
```

Add an implementation (Supabase, Prisma-backed API route, etc.) and change one
line in `lib/repository/index.ts`:

```ts
export const repository: FeedbackRepository = supabaseRepository;
```

No component changes required.

## Structure

```
app/
  layout.tsx            fonts, theme provider, toaster, metadata
  page.tsx              landing
  feedback/page.tsx     reads ?property= and renders the wizard
  thank-you/page.tsx
  admin/page.tsx
  r/[code]/page.tsx     QR redirect
  not-found.tsx
components/
  ui/                   button, card, input, textarea, label, checkbox,
                        progress, badge, separator, skeleton, sonner
  feedback/             wizard, star rating, photo upload, four steps
  admin/                dashboard, property performance, KPI cards, charts,
                        guest link card, responses table, response detail
  marketing/            landing sections
  stars.tsx             static star display
  site-header.tsx / site-footer.tsx / theme-toggle.tsx
public/
  media/                Kumarakom hero film + poster frame
lib/
  types.ts              domain model
  feedback-schema.ts    Zod schema + step field map
  analytics.ts          KPI, trend, category, distribution and NPS maths
  repository/           typed repository + localStorage adapter + seed data
  draft.ts              autosave / restore
  image.ts              client-side image compression (5 MB input cap)
  csv.ts                CSV export
  properties.ts         demo property directory
```

## Design notes

- Warm off-white `#FAF8F5`, charcoal `#1C1917`, terracotta `#C2410C`.
- Fraunces for display headings, Inter for UI.
- Dark mode uses the `class` strategy with a warm charcoal palette, not an
  inverted light theme.
- Motion is 150–250 ms ease-out with an 8 px rise, plus a spring on star
  selection. `prefers-reduced-motion` is respected everywhere.
- The landing hero uses a muted, looping film from Kumarakom Lake Resort with a
  poster frame, a pointer-driven 3D card tilt, and depth-layered QR/sentiment
  chips. Reduced-motion visitors get the poster only; the video unmounts.
- Accessibility: labelled controls, radiogroup keyboard support on the star
  rating, visible focus rings, `aria-live` counters and errors, skip-free
  landmark structure, and a single tab stop per step.

## Deploy

Vercel is the simplest target (the app uses server components and redirects).
For GitHub Pages, add `output: "export"` and a `basePath`; `/r/[code]` would need
to become a client-side redirect because static export cannot run server
redirects.
