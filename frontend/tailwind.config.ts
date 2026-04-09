import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}", // optional
  ],
  theme: {
    extend: {
      fontFamily: {
        leeka: ['Leeka', 'sans-serif'],
        supreen: ['Supreen', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;