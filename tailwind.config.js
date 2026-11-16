/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Keep in sync with utils/theme.ts
      colors: {
        bg: "#0F0F10",
        surface: "#18181B",
        elevated: "#222226",
        line: "#2E2E33",
        "line-strong": "#3F3F46",
        "fg-secondary": "#A1A1AA",
        muted: "#71717A",
        accent: "#34D399",
        "accent-strong": "#10B981",
        build: "#34D399",
        quit: "#F59E0B",
        danger: "#F87171",
        skip: "#60A5FA",
      },
    },
  },
  plugins: [],
};
