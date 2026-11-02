import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F8F3EC",
        offwhite: "#FBFAF7",
        beige: "#E8DCC8",
        softbrown: "#8C6D4F",
        gold: "#C9A24B",
        charcoal: "#1F1B16",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
