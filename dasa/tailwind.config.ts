import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-deep": "var(--bg-deep)",
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
