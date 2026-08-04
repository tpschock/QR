import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1E3A5C",
          "navy-light": "#3F6690",
          "navy-dark": "#122236",
          grey: "#808285",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-20px) skewX(-20deg)" },
          "35%": { transform: "translateX(20px) skewX(-20deg)" },
          "100%": { transform: "translateX(20px) skewX(-20deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
