import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SaaS Design System Tokens
        brand: {
          primary: "#1A5276",
          primaryHover: "#154360",
          accent: "#2563EB",
          accentHover: "#1D4ED8",
          saffron: "#D97706",
          saffronLight: "#FEF3C7",
        },
        surface: {
          base: "#F8FAFC",
          card: "#FFFFFF",
          alt: "#F1F5F9",
          dark: "#0F172A",
          darkCard: "#1E293B",
          darkMuted: "#334155",
        },
        border: {
          subtle: "#F1F5F9",
          default: "#E2E8F0",
          strong: "#CBD5E1",
          dark: "#334155",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#3B82F6",
        },
        // Existing 1:1 CBT Exam tokens (Preserved for full fidelity)
        exam: {
          primary: "#1A5276",
          primaryHover: "#154360",
          saffron: "#E67E22",
          success: "#27AE60",
          danger: "#C0392B",
          purple: "#8E44AD",
          bg: "#F4F6F7",
          card: "#FFFFFF",
          text: "#1C2833",
          muted: "#7F8C8D",
          border: "#D5D8DC",
          answered: "#27AE60",
          unanswered: "#E74C3C",
          marked: "#8E44AD",
          markedAnswered: "#6C3483",
          notVisited: "#BDC3C7",
          current: "#2980B9",
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 10px 30px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.06)",
        glow: "0 0 25px -5px rgba(37, 99, 235, 0.25)",
        dropdown: "0 10px 38px -10px rgba(15, 23, 42, 0.18), 0 10px 20px -15px rgba(15, 23, 42, 0.1)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
