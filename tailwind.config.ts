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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          orange: "#F94001",
          "orange-dark": "#D93600",
          "orange-light": "#FFF1EC",
          navy: "#021526",
          "navy-dark": "#010d18",
          "navy-light": "#06243f",
          "navy-surface": "#0a2e4e",
          surface: "#F3F4F4",
          secondary: "#5F6368",
          bg: "#F8F9FA",
        },
      },
      fontFamily: {
        display: ["var(--font-urbanist)", "Urbanist", "sans-serif"],
        sans: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
