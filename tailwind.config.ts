import type { Config } from "tailwindcss";

/**
 * Krāsas, atstatumi un mērogs nāk no src/styles/tokens.css - šeit ir tikai
 * Tailwind karte uz tiem. Neviena hex vērtība šajā failā: ja krāsa mainās,
 * tā mainās vienā vietā (tokeni), ne divās.
 */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        label: ["var(--font-label)"],
      },
      colors: {
        border: "var(--line)",
        background: "var(--ink-900)",
        foreground: "var(--paper)",
        ink: {
          950: "var(--ink-950)",
          900: "var(--ink-900)",
          850: "var(--ink-850)",
          card: "var(--ink-card)",
          800: "var(--ink-800)",
          750: "var(--ink-750)",
        },
        paper: {
          DEFAULT: "var(--paper)",
          2: "var(--paper-2)",
          dim: "var(--paper-dim)",
          faint: "var(--paper-faint)",
        },
        "on-paper": {
          DEFAULT: "var(--on-paper)",
          dim: "var(--on-paper-dim)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          soft: "var(--amber-soft)",
          deep: "var(--amber-deep)",
          paper: "var(--amber-on-paper)",
        },
        "on-amber": "var(--on-amber)",
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
          amber: "var(--line-amber)",
          paper: "var(--line-on-paper)",
        },
        /* shadcn tooltip un sonner mantojums - vienīgie divi faili, kas to lieto */
        popover: { DEFAULT: "var(--ink-850)", foreground: "var(--paper)" },
        muted: { DEFAULT: "var(--ink-800)", foreground: "var(--paper-dim)" },
      },
      borderRadius: {
        DEFAULT: "var(--r-base)",
        base: "var(--r-base)",
        field: "var(--r-field)",
        card: "var(--r-card)",
        full: "9999px",
      },
      fontSize: {
        display: ["var(--display-1)", { lineHeight: "1.04", letterSpacing: "-0.045em" }],
        "display-2": ["var(--display-2)", { lineHeight: "1.04", letterSpacing: "-0.04em" }],
        giant: ["var(--giant)", { lineHeight: "1", letterSpacing: "-0.04em" }],
        h2: ["var(--h2)", { lineHeight: "1.02", letterSpacing: "-0.045em" }],
        h3: ["var(--h3)", { lineHeight: "1.04", letterSpacing: "-0.04em" }],
        label: ["12px", { lineHeight: "1.2", letterSpacing: "0.02em" }],
      },
      spacing: {
        "pad-x": "var(--pad-x)",
        "sec-sm": "var(--sec-sm)",
        "sec-md": "var(--sec-md)",
        "sec-lg": "var(--sec-lg)",
        grid: "var(--gap-grid)",
      },
      maxWidth: {
        wrap: "var(--wrap)",
      },
      transitionTimingFunction: {
        dir: "var(--ease)",
        settle: "var(--ease-settle)",
        spring: "var(--ease-spring)",
      },
    },
  },
  plugins: [],
} satisfies Config;
