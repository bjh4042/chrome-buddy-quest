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
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        xs: "420px",
        "3xl": "1700px",
      },
      fontSize: {
        "fluid-2xs": ["var(--fs-2xs)", { lineHeight: "1.3" }],
        "fluid-xs":  ["var(--fs-xs)",  { lineHeight: "1.35" }],
        "fluid-sm":  ["var(--fs-sm)",  { lineHeight: "1.4" }],
        "fluid-base":["var(--fs-base)",{ lineHeight: "1.5" }],
        "fluid-lg":  ["var(--fs-lg)",  { lineHeight: "1.45" }],
        "fluid-xl":  ["var(--fs-xl)",  { lineHeight: "1.3" }],
        "fluid-2xl": ["var(--fs-2xl)", { lineHeight: "1.2" }],
        "fluid-3xl": ["var(--fs-3xl)", { lineHeight: "1.15" }],
      },
      spacing: {
        "fluid-1": "var(--space-1)",
        "fluid-2": "var(--space-2)",
        "fluid-3": "var(--space-3)",
        "fluid-4": "var(--space-4)",
        "fluid-5": "var(--space-5)",
        "fluid-6": "var(--space-6)",
      },
      fontFamily: {
        display: ['Jua', 'sans-serif'],
        body: ['Noto Sans KR', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        win: {
          taskbar: "hsl(var(--win-taskbar))",
          desktop: "hsl(var(--win-desktop))",
          window: "hsl(var(--win-window))",
        },
        quest: {
          gold: "hsl(var(--quest-gold))",
          complete: "hsl(var(--quest-complete))",
          locked: "hsl(var(--quest-locked))",
        },
        star: "hsl(var(--star-fill))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        game: "var(--shadow-game)",
        card: "var(--shadow-card)",
        quest: "var(--shadow-quest)",
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
