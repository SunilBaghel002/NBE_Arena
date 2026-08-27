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
    },
  },
  plugins: [],
};

export default config;
