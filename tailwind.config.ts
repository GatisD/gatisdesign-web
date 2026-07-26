import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        accent: ["var(--font-accent)"],
        display: ["system-ui", "sans-serif"],
        headline: ["system-ui", "sans-serif"],
        mono: ["var(--font-sans)"],
        label: ["var(--font-sans)"],
      },
      colors: {
        /*
         * Vecās gaišās paletes atlikums. Palikuši tikai tie, ko reāli lieto kāds
         * fails: border (globālais noklusējums), background/foreground (body,
         * Layout, sonner), muted (sonner) un popover (shadcn tooltip).
         */
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        /* Vara akcenta sistēma (koncepts C "Tumšais amats") */
        ink: {
          950: "var(--ink-950)",
          900: "var(--ink-900)",
          850: "var(--ink-850)",
          800: "var(--ink-800)",
          750: "var(--ink-750)",
          700: "var(--ink-700)",
        },
        paper: {
          DEFAULT: "var(--paper)",
          2: "var(--paper-2)",
          dim: "var(--paper-dim)",
          faint: "var(--paper-faint)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          soft: "var(--amber-soft)",
          deep: "var(--amber-deep)",
          glow: "var(--amber-glow)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px",
      },
      letterSpacing: {
        widest: "0.2em",
      },
      maxWidth: {
        wrap: "var(--wrap)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
