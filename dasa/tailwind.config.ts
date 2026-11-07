import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--bg-base)",
        sand: "var(--bg-alt)",
        surface: "var(--surface)",
        deep: "var(--deep)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        "on-photo": "var(--on-photo)",
        "photo-fallback": "var(--photo-fallback)",
        btn: "var(--btn-border)",
        "btn-hover": "var(--btn-hover)",
        "line-hover": "var(--line-hover)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-muted": "var(--ink-muted)",
        hairline: "var(--hairline)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      spacing: { gutter: "var(--gutter)", section: "var(--section-y)" },
    },
  },
  plugins: [],
};
export default config;
