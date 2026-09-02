import type { Config } from "tailwindcss";

/**
 * Design tokens for the Zayla Monroe portfolio.
 * Editorial dark theme: pure black ground, white type, a single hot accent.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#ffffff",
        accent: {
          DEFAULT: "#fd321c",
          warm: "#ff8a00",
        },
        hair: "rgba(255,255,255,0.14)",
        hairStrong: "rgba(255,255,255,0.28)",
        dim: "rgba(255,255,255,0.56)",
        dimmer: "rgba(255,255,255,0.38)",
        surface: "#0a0a0a",
        surfaceUp: "#111111",
      },
      fontFamily: {
        display: ['Poppins', 'Poppins Fallback', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Inter Fallback', 'system-ui', 'sans-serif'],
      },
      /* Scale lifted from the reference: 12→250px */
      fontSize: {
        "2xs": ["0.75rem", { lineHeight: "1.2em" }],
        xs: ["0.875rem", { lineHeight: "1.2em" }],
        sm: ["1rem", { lineHeight: "1.5em" }],
        base: ["1.125rem", { lineHeight: "1.5em" }],
        md: ["1.25rem", { lineHeight: "1.4em" }],
        lg: ["1.5rem", { lineHeight: "1.3em" }],
        xl: ["1.875rem", { lineHeight: "1.2em" }],
        "2xl": ["2.125rem", { lineHeight: "1.1em" }],
        "3xl": ["2.75rem", { lineHeight: "1em" }],
        "4xl": ["3rem", { lineHeight: "1em" }],
        "5xl": ["3.5rem", { lineHeight: "0.95em" }],
        "6xl": ["4.5rem", { lineHeight: "0.9em" }],
        "7xl": ["5rem", { lineHeight: "0.9em" }],
        "8xl": ["7.5rem", { lineHeight: "0.85em" }],
        "9xl": ["9.375rem", { lineHeight: "0.85em" }],
        "10xl": ["12.5rem", { lineHeight: "0.8em" }],
        "11xl": ["15.625rem", { lineHeight: "0.8em" }],
      },
      letterSpacing: {
        tightest: "-0.08em",
        tighter: "-0.05em",
        tight: "-0.04em",
        snug: "-0.03em",
        normalish: "-0.02em",
        wide: "0.08em",
        wider: "0.14em",
      },
      maxWidth: {
        shell: "1600px",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
        swift: "cubic-bezier(0.65, 0, 0.35, 1)",
        /* The curve the reference gives its buttons: a long, late settle. */
        button: "cubic-bezier(0.625, 0.05, 0, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translate3d(0,0,0)" },
          to: { transform: "translate3d(-50%,0,0)" },
        },
        marqueeReverse: {
          from: { transform: "translate3d(-50%,0,0)" },
          to: { transform: "translate3d(0,0,0)" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        marquee: "marquee var(--marquee-duration,28s) linear infinite",
        "marquee-reverse": "marqueeReverse var(--marquee-duration,28s) linear infinite",
        "spin-slow": "spinSlow 14s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
