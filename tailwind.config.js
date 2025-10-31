/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#0B0E11",
        gold: "#F0B90B",
        panel: "#0f1720",
        grayLight: "#1E2329",
        grayMid: "#2B3139",
        grayText: "#A1A1A1",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
