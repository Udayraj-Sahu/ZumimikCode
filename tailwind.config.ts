import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        popover: "rgb(var(--popover) / <alpha-value>)",
        "popover-foreground": "rgb(var(--popover-foreground) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "rgb(var(--secondary-foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
        "destructive-foreground": "rgb(var(--destructive-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        input: "var(--input)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        "chart-1": "rgb(var(--chart-1) / <alpha-value>)",
        "chart-2": "rgb(var(--chart-2) / <alpha-value>)",
        "chart-3": "rgb(var(--chart-3) / <alpha-value>)",
        "chart-4": "rgb(var(--chart-4) / <alpha-value>)",
        "chart-5": "rgb(var(--chart-5) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        glass: "rgb(var(--glass) / <alpha-value>)",
        "glass-border": "rgb(var(--glass-border) / <alpha-value>)",
        sidebar: {
          DEFAULT: "rgb(var(--sidebar) / <alpha-value>)",
          foreground: "rgb(var(--sidebar-foreground) / <alpha-value>)",
          primary: "rgb(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "rgb(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "rgb(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "rgb(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-border)",
          ring: "rgb(var(--sidebar-ring) / <alpha-value>)",
        },
        chrome: {
          DEFAULT: "var(--chrome)",
          raised: "var(--chrome-raised)",
          border: "var(--chrome-border)",
          muted: "var(--chrome-muted)",
          hover: "var(--chrome-hover)",
          foreground: "var(--chrome-foreground)",
          active: "var(--chrome-active)",
          avatar: "var(--chrome-avatar)",
        },
      },
      fontSize: {
        micro: ["11px", { lineHeight: "1.3" }],
        "fluid-xs": ["clamp(11px, 1vw, 12px)", { lineHeight: "1.3" }],
        "fluid-sm": ["clamp(12px, 1.4vw, 13px)", { lineHeight: "1.4" }],
        "fluid-base": ["clamp(13px, 2vw, 15px)", { lineHeight: "1.5" }],
        "fluid-lg": ["clamp(15px, 2.5vw, 20px)", { lineHeight: "1.3" }],
        "fluid-xl": ["clamp(18px, 3.5vw, 28px)", { lineHeight: "1.2" }],
        "fluid-2xl": ["clamp(22px, 4.5vw, 34px)", { lineHeight: "1.1" }],
        "fluid-3xl": ["clamp(28px, 5vw, 40px)", { lineHeight: "1.1" }],
      },
      keyframes: {
        "breath-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgb(var(--primary))", opacity: "1" },
          "50%": { boxShadow: "0 0 18px rgb(var(--primary))", opacity: "0.85" },
        },
      },
      animation: {
        "breath-glow": "breath-glow 2.5s ease-in-out infinite",
      },
      backgroundImage: {
        cta: "linear-gradient(90deg, var(--cta-from), var(--cta-to))",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
