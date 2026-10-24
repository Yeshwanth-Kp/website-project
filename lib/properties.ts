import type { Property } from "./types";

/**
 * Demo property directory. In a real deployment this comes from your PMS or
 * a `properties` table — the rest of the app only needs `id`, `code`, `name`.
 */
export const PROPERTIES: Property[] = [
  {
    id: "willow-house",
    code: "willow-house",
    name: "Willow House",
    city: "Copenhagen",
    invitationsSent: 420,
  },
  {
    id: "casa-oliva",
    code: "casa-oliva",
    name: "Casa Oliva",
    city: "Lisbon",
    invitationsSent: 356,
  },
  {
    id: "harborview",
    code: "harborview",
    name: "Harborview",
    city: "Porto",
    invitationsSent: 288,
  },
];

export const DEFAULT_PROPERTY: Property = PROPERTIES[0] as Property;

export function getPropertyByCode(code: string | null | undefined): Property | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toLowerCase();
  return PROPERTIES.find((property) => property.code === normalized);
}

export function getPropertyById(id: string): Property | undefined {
  return PROPERTIES.find((property) => property.id === id);
}

export function invitationsFor(propertyIds: string[]): number {
  if (propertyIds.length === 0) {
    return PROPERTIES.reduce((total, property) => total + property.invitationsSent, 0);
  }

  return PROPERTIES.filter((property) => propertyIds.includes(property.id)).reduce(
    (total, property) => total + property.invitationsSent,
    0,
  );
}
