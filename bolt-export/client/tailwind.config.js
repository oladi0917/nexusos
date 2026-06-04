/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#0C0C0C",
        card: "#181818",
        border: "#2A2A2A",
        secondary: "#1A1A1A",
        gold: "#C9A84C",
        "gold-dark": "#9A7828",
        "gold-light": "rgba(201,168,76,0.15)",
        fg: "#F5F5F5",
        muted: "#888888",
        green: "#10B981",
        red: "#EF4444",
      },
    },
  },
  plugins: [],
};
