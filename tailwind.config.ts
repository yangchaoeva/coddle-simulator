import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2233",
        peach: "#f7d5bf",
        coral: "#f38b74",
        cream: "#fffaf2",
        sage: "#b6c7a6",
        berry: "#7f3559",
      },
      boxShadow: {
        card: "0 18px 50px rgba(31, 34, 51, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
