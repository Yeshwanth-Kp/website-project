/**
 * Hex values rather than CSS variables: Recharts writes these into SVG
 * presentation attributes, where `var()` is not reliably resolved.
 * Both tones are chosen to stay legible on light and dark surfaces.
 */
export const CHART_COLORS = {
  primary: "#C2410C",
  primarySoft: "#E8895C",
  neutral: "#A8A29E",
  grid: "rgba(120, 113, 108, 0.22)",
  success: "#3F7D5D",
  warning: "#C98A25",
  danger: "#B3261E",
} as const;
