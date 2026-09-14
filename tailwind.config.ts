import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A", // Slate 900 base
        foreground: "#F8FAFC",
        primary: {
          DEFAULT: "#F97316", // Orange 500
          hover: "#EA580C",
        },
        secondary: {
          DEFAULT: "#DB2777", // Pink 600
          hover: "#BE185D",
        },
        gold: "#EAB308",
        card: "#1E293B", // Slate 800
        border: "#334155", // Slate 700
      },
    },
  },
  plugins: [],
};
export default config;