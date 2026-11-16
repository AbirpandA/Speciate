/**
 * Design tokens. Mirrored in tailwind.config.js so classes like `bg-surface`
 * and `text-muted` match the values used in inline styles / SVG.
 */
export const theme = {
  bg: "#0F0F10",
  surface: "#18181B",
  elevated: "#222226",
  border: "#2E2E33",
  borderStrong: "#3F3F46",

  text: "#FAFAFA",
  textSecondary: "#A1A1AA",
  muted: "#71717A",

  accent: "#34D399",
  accentStrong: "#10B981",
  accentSoft: "rgba(52, 211, 153, 0.14)",

  // build ("do") vs quit ("don't")
  build: "#34D399",
  quit: "#F59E0B",
  quitSoft: "rgba(245, 158, 11, 0.14)",

  danger: "#F87171",
  skip: "#60A5FA",
} as const;

export type Theme = typeof theme;
