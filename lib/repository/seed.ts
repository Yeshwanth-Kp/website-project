import type { FeedbackEntry, Sentiment } from "../types";

const DAY = 86_400_000;

const NAMES = [
  "Priya Sharma",
  "Daniel Okafor",
  "Meera Iyer",
  "Tom Whitfield",
  "Aiko Tanaka",
  "Lucas Meyer",
  "Sofia Almeida",
  "Jonas Berg",
  "Amara Nwosu",
  "Elena Rossi",
  "Noah Fischer",
  "Clara Dubois",
  "Ravi Menon",
  "Freya Larsen",
  "Mateo Silva",
  "Hana Kim",
  "Oliver Grant",
  "Nadia Haddad",
  "Erik Johansson",
  "Isabella Costa",
  "Kwame Mensah",
  "Lina Weber",
  "Marco Bianchi",
  "Sara Lindqvist",
  "Yuki Sato",
  "Adam Kowalski",
  "Zara Ahmed",
  "Pedro Alves",
  "Ines Moreira",
  "Felix Bauer",
] as const;

const ROOMS = [
  "Room 101",
  "Room 104",
  "Room 108",
  "Room 112",
  "Room 201",
  "Room 205",
  "Room 209",
  "Room 214",
  "Room 301",
  "Room 305",
  "Suite 1",
  "Suite 2",
  "Suite 3",
] as const;

const KUMARAKOM_ROOMS = [
  "Heritage Room 14",
  "Heritage Room 22",
  "Lakeview Villa 3",
  "Lakeview Villa 7",
  "Backwater Cottage 5",
  "Backwater Cottage 9",
  "Garden Villa 2",
  "Travancore Suite",
] as const;

const COMMENTS: Record<number, readonly string[]> = {
  5: [
    "The room was spotless and the team remembered our names by day two. Breakfast on the terrace was the highlight of the trip.",
    "Immaculate room, genuinely warm service, and the quietest sleep I have had in months. We will be back in spring.",
    "We mentioned it was our anniversary and came back to find dessert waiting in the room. Small gesture, huge impact.",
    "Every detail felt considered — the linens, the lighting, the coffee. Easily the best stay of our trip.",
    "Booked two nights, stayed four. The front desk rearranged everything without a fuss. Faultless.",
    "The bar staff made the whole evening. Great local recommendations and a properly made negroni.",
    "Breakfast was fresh, generous and served with actual warmth. Hard to leave the table.",
  ],
  4: [
    "Quiet, comfortable and a two-minute walk to the river. The shower pressure could be better, but everything else was excellent.",
    "Great base for exploring. Breakfast was fresh and generous. Would happily stay again.",
    "Very good stay overall. Check-in took a little longer than expected, but the room more than made up for it.",
    "Lovely room and excellent housekeeping. The Wi-Fi dropped once in the evening, otherwise no complaints.",
    "Staff were thoughtful and the bed was superb. A little street noise on Friday night, but nothing serious.",
    "Beautiful property and a genuinely good breakfast. Would have liked a later checkout, but they were fully booked.",
  ],
  3: [
    "Solid stay overall. The room was clean, but the street-facing side gets noisy on weekend nights.",
    "Fine for the price. Breakfast was busy and a bit chaotic, and the room felt dated compared with the photos.",
    "Good location and friendly staff, though the air conditioning was erratic and the bathroom small.",
    "Nothing went wrong, nothing stood out. The Wi-Fi was slow and the bar closed early.",
    "Comfortable enough, but housekeeping arrived late twice and we had to ask for towels.",
  ],
  2: [
    "The room was not ready at check-in and the shower ran cold. Staff were apologetic but it took two calls to fix.",
    "Noisy until midnight and the breakfast ran out of most things by nine. Expected more for the price.",
    "Check-in was slow, the room smelled of smoke, and nobody followed up on the complaint we left at reception.",
    "Wi-Fi barely worked and the bed was uncomfortable. The location is the only thing I would recommend.",
  ],
  1: [
    "Two hours to get into the room and no apology. The bathroom had not been cleaned properly. Very disappointing.",
    "The air conditioning failed overnight and reception did not answer. We checked out a day early.",
    "Booked a quiet room, got a street-facing one above the bar. Nobody seemed to care when we asked to move.",
  ],
};

const KUMARAKOM_COMMENTS: Record<number, readonly string[]> = {
  5: [
    "Waking up to the backwaters from our villa was the whole trip. The team arranged a sunrise boat ride and remembered our coffee order by day two.",
    "The heritage villa was beautiful, and the staff treated our anniversary like it mattered. Dinner by the lake was the highlight.",
    "We came for two nights and left wishing we had booked four. The Ayurvedic massage and the evening music were worth the journey alone.",
    "Every corner of the resort is considered — the meandering pool, the gardens, the quiet. Service was warm without ever being intrusive.",
    "The houseboat pickup was seamless and our room was ready early. Easily the most restful stay we have had in India.",
    "Breakfast by the backwater, fresh appam and stew, and a team that greeted us by name. Faultless.",
  ],
  4: [
    "Beautiful setting and genuinely thoughtful service. The bathroom in our villa could use a refresh, but the views and breakfast more than made up for it.",
    "The resort is stunning and the backwater pool is unlike anywhere else. A little slow at check-in, but the room and gardens were lovely.",
    "Very good stay. The Ayurvedic spa was excellent, though our villa was a fair walk from the main restaurant. We would still return.",
    "Quiet, green and beautifully kept. Wi-Fi was patchy in the villa, but the team fixed it the same evening.",
    "Lovely heritage property with excellent food. The evening performance was a highlight; the room was a touch dark for reading.",
    "Great stay overall. Breakfast was generous and the birdlife at dawn was wonderful. Would have liked a later checkout.",
  ],
  3: [
    "A beautiful property, but the villa felt tired in places and the restaurant was slow at dinner. The setting is exceptional.",
    "Good stay overall. The backwater views are the reason to come, though the spa pricing felt high and the Wi-Fi was unreliable.",
    "The gardens and pool are lovely, but our room was far from reception and the buggy took a long time. Friendly team.",
    "Nice heritage feel, but housekeeping arrived late and the air conditioning struggled in the afternoon heat.",
    "The setting earns the rating; the service did not always match it. Breakfast was excellent, dinner less so.",
  ],
  2: [
    "Our villa was not ready on arrival and the air conditioning never cooled properly. The team apologised but it took two calls.",
    "The property is beautiful, but our room smelled damp and the restaurant ran out of options by nine. Not what we expected for the price.",
    "Slow check-in and a long wait for the buggy. The backwaters are stunning, but the stay did not feel worth what we paid.",
    "Wi-Fi barely worked in the villa and the shower ran cold. The setting deserves better maintenance.",
  ],
  1: [
    "Three calls and two hours before we got into our villa, and no one took ownership. A disappointing start to a trip we had planned for months.",
    "The air conditioning failed overnight and reception did not answer. We left a day early.",
    "Our room was not cleaned properly and the noise from the pool went on past midnight. Nobody followed up.",
  ],
};

const POSITIVE_TAGS = [
  "Location",
  "Breakfast",
  "Housekeeping",
  "Staff",
  "Bed comfort",
  "Bar",
  "Pool",
  "Check-in",
] as const;

const NEGATIVE_TAGS = ["Noise", "Wi-Fi", "Check-in", "Water pressure", "Parking", "Value"] as const;

function mulberry32(seed: number): () => number {
  let state = seed;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pick<T>(items: readonly T[], random: () => number): T {
  const index = Math.floor(random() * items.length);
  return items[index] ?? items[0]!;
}

function ratingFor(random: () => number): number {
  const roll = random();
  if (roll < 0.52) return 5;
  if (roll < 0.8) return 4;
  if (roll < 0.91) return 3;
  if (roll < 0.97) return 2;
  return 1;
}

function sentimentFor(rating: number, random: () => number): Sentiment {
  if (rating === 5) return random() < 0.72 ? "delighted" : "happy";
  if (rating === 4) return random() < 0.55 ? "happy" : "neutral";
  if (rating === 3) return random() < 0.7 ? "neutral" : "unhappy";
  if (rating === 2) return random() < 0.7 ? "unhappy" : "upset";
  return "upset";
}

function npsFor(rating: number, random: () => number): number {
  if (rating === 5) return random() < 0.72 ? 10 : 9;
  if (rating === 4) return random() < 0.6 ? 9 : 8;
  if (rating === 3) return random() < 0.55 ? 7 : 6;
  if (rating === 2) return random() < 0.5 ? 5 : 4;
  return Math.floor(random() * 4);
}

function categoryScore(base: number, random: () => number): number {
  return clamp(Math.round(base + (random() - 0.5) * 2.6), 1, 5);
}

function tagsFor(rating: number, random: () => number): string[] {
  const pool = rating >= 4 ? POSITIVE_TAGS : rating === 3 ? [...POSITIVE_TAGS, ...NEGATIVE_TAGS] : NEGATIVE_TAGS;
  const count = Math.floor(random() * 3);

  if (count === 0) return [];

  const chosen = new Set<string>();
  let guard = 0;
  while (chosen.size < count && guard < 12) {
    chosen.add(pick(pool, random));
    guard += 1;
  }

  return [...chosen];
}

function emailFor(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
}

/**
 * Deterministic demo data: 84 responses across the last 90 days, weighted
 * toward Kumarakom Lake Resort. Runs once on first load so the dashboard is
 * never an empty shell.
 */
export function createSeedEntries(now: number = Date.now()): FeedbackEntry[] {
  const random = mulberry32(20_261_024);
  const properties = [
    "kumarakom-lake-resort",
    "willow-house",
    "kumarakom-lake-resort",
    "casa-oliva",
    "harborview",
  ] as const;
  const entries: FeedbackEntry[] = [];

  for (let index = 0; index < 84; index += 1) {
    const rating = ratingFor(random);
    const propertyId = properties[index % properties.length] ?? "kumarakom-lake-resort";
    const isKumarakom = propertyId === "kumarakom-lake-resort";
    const name = pick(NAMES, random);
    const daysAgo = Math.floor(random() * 90);
    const createdAt = new Date(now - daysAgo * DAY);
    createdAt.setHours(8 + Math.floor(random() * 13), Math.floor(random() * 60), 0, 0);
    const comments = isKumarakom ? KUMARAKOM_COMMENTS : COMMENTS;

    entries.push({
      id: `seed-${index + 1}`,
      propertyId,
      createdAt: createdAt.toISOString(),
      overallRating: rating,
      sentiment: sentimentFor(rating, random),
      nps: npsFor(rating, random),
      categories: {
        cleanliness: categoryScore(rating, random),
        staff: categoryScore(rating, random),
        food: categoryScore(rating, random),
        comfort: categoryScore(rating, random),
        value: categoryScore(rating, random),
      },
      tags: tagsFor(rating, random),
      comment: pick(comments[rating] ?? comments[3]!, random),
      guestName: name,
      guestEmail: random() < 0.45 ? emailFor(name) : null,
      roomNumber: random() < 0.7
        ? pick(isKumarakom ? KUMARAKOM_ROOMS : ROOMS, random)
        : null,
      photoDataUrl: null,
      consent: true,
    });
  }

  return entries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
